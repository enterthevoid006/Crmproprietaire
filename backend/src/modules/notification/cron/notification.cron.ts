import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { NotificationService } from '../notification.service';
import { EmailService } from '../../../shared/infrastructure/email/email.service';

@Injectable()
export class NotificationCron {
    private readonly logger = new Logger(NotificationCron.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationService: NotificationService,
        private readonly emailService: EmailService,
    ) {}

    /** Runs every hour at minute 0 */
    @Cron('0 * * * *')
    async runChecks() {
        this.logger.log('[Cron] Starting notification checks...');
        await Promise.allSettled([
            this.checkTasksDue(),
            this.checkQuotesExpiring(),
            this.checkInvoicesOverdue(),
        ]);
        this.logger.log('[Cron] Notification checks complete.');
    }

    // ─── Tasks due within ±24h ────────────────────────────────────────────────

    private async checkTasksDue() {
        const now = new Date();
        const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24h ago (overdue)
        const windowEnd   = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h ahead (upcoming)

        const tasks = await this.prisma.task.findMany({
            where: {
                dueDate: { gte: windowStart, lte: windowEnd },
                status: { not: 'DONE' },
            },
            include: {
                tenant: {
                    include: { users: { select: { id: true, email: true } } },
                },
            },
        });

        let created = 0;
        for (const task of tasks) {
            const isOverdue = task.dueDate! < now;
            const title   = isOverdue ? 'Tâche en retard' : 'Tâche à échéance';
            const message = isOverdue
                ? `La tâche "${task.title}" est en retard.`
                : `La tâche "${task.title}" arrive à échéance dans moins de 24h.`;

            for (const user of task.tenant.users) {
                const wasCreated = await this.notificationService.createIfNotExists({
                    tenantId: task.tenantId,
                    userId: user.id,
                    type: 'TASK_DUE',
                    title,
                    message,
                    resourceId: task.id,
                    resourceType: 'task',
                });

                if (wasCreated && isOverdue) {
                    try {
                        await this.emailService.sendTaskOverdueReminder(user.email, task.title);
                    } catch (e) {
                        this.logger.error(`Email failed for task ${task.id}`, e);
                    }
                }
                if (wasCreated) created++;
            }
        }
        if (created > 0) this.logger.log(`[Cron] TASK_DUE: ${created} notifications created.`);
    }

    // ─── Quotes expiring within 3 days ────────────────────────────────────────

    private async checkQuotesExpiring() {
        const now = new Date();
        const in3days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        const quotes = await this.prisma.quote.findMany({
            where: {
                validUntil: { gte: now, lte: in3days },
                status: 'SENT',
            },
            include: {
                tenant: {
                    include: { users: { select: { id: true } } },
                },
            },
        });

        let created = 0;
        for (const quote of quotes) {
            const daysLeft = Math.ceil((quote.validUntil.getTime() - now.getTime()) / 86400000);
            for (const user of quote.tenant.users) {
                const wasCreated = await this.notificationService.createIfNotExists({
                    tenantId: quote.tenantId,
                    userId: user.id,
                    type: 'QUOTE_EXPIRING',
                    title: 'Devis expirant bientôt',
                    message: `Le devis ${quote.number} expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.`,
                    resourceId: quote.id,
                    resourceType: 'quote',
                });
                if (wasCreated) created++;
            }
        }
        if (created > 0) this.logger.log(`[Cron] QUOTE_EXPIRING: ${created} notifications created.`);
    }

    // ─── Invoices unpaid for 30+ days ─────────────────────────────────────────

    private async checkInvoicesOverdue() {
        const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const invoices = await this.prisma.invoice.findMany({
            where: {
                dueDate: { lte: threshold },
                status: { in: ['SENT', 'OVERDUE'] },
            },
            include: {
                tenant: {
                    include: { users: { select: { id: true, email: true } } },
                },
            },
        });

        let created = 0;
        for (const invoice of invoices) {
            for (const user of invoice.tenant.users) {
                const formattedTotal = new Intl.NumberFormat('fr-FR', {
                    style: 'currency', currency: 'EUR',
                }).format(invoice.total);

                const wasCreated = await this.notificationService.createIfNotExists({
                    tenantId: invoice.tenantId,
                    userId: user.id,
                    type: 'INVOICE_OVERDUE',
                    title: 'Facture impayée',
                    message: `La facture ${invoice.number} (${formattedTotal}) est impayée depuis plus de 30 jours.`,
                    resourceId: invoice.id,
                    resourceType: 'invoice',
                });

                if (wasCreated) {
                    created++;
                    try {
                        await this.emailService.sendInvoiceOverdueReminder(
                            user.email,
                            invoice.number,
                            invoice.total,
                        );
                    } catch (e) {
                        this.logger.error(`Email failed for invoice ${invoice.id}`, e);
                    }
                }
            }
        }
        if (created > 0) this.logger.log(`[Cron] INVOICE_OVERDUE: ${created} notifications created.`);
    }
}
