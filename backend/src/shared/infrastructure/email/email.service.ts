import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly transporter: nodemailer.Transporter;
    private readonly from: string;

    constructor(private configService: ConfigService) {
        const user = this.configService.get<string>('MAIL_USER') ?? '';
        const pass = this.configService.get<string>('MAIL_PASSWORD') ?? '';
        this.from = 'Bonjour CRM <theosageron@gmail.com>';

        this.transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: { user, pass },
        });
    }

    async sendVerificationEmail(to: string, token: string): Promise<void> {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
        const verifyUrl = `${frontendUrl}/verify/${token}`;

        const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#4f46e5;padding:32px 40px;text-align:center;">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;background:rgba(255,255,255,0.15);border-radius:12px;margin-bottom:12px;">
              <span style="font-size:24px;">🏢</span>
            </div>
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">CRM Propriétaire</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#111827;font-size:18px;font-weight:700;">Activez votre compte</h2>
            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
              Merci de vous être inscrit. Cliquez sur le bouton ci-dessous pour vérifier votre adresse email et accéder à votre espace de travail.
            </p>

            <a href="${verifyUrl}" style="display:block;text-align:center;padding:14px 24px;background:#4f46e5;color:#ffffff;font-weight:600;font-size:15px;border-radius:8px;text-decoration:none;">
              Activer mon compte
            </a>

            <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
              Ce lien expire dans 24 heures.<br>
              Si vous n'avez pas créé de compte, ignorez cet email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0;color:#d1d5db;font-size:11px;">
              CRM Propriétaire · Lien de vérification à usage unique
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

        await this.transporter.sendMail({
            from: this.from,
            to,
            subject: 'Activez votre compte CRM',
            html,
        });

        this.logger.log(`Verification email sent to ${to}`);
    }

    async sendInvitationEmail(to: string, token: string, tenantName: string, inviterEmail: string): Promise<void> {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
        const acceptUrl = `${frontendUrl}/accept-invite/${token}`;

        const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#4f46e5;padding:32px 40px;text-align:center;">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;background:rgba(255,255,255,0.15);border-radius:12px;margin-bottom:12px;">
              <span style="font-size:24px;">👥</span>
            </div>
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">CRM Propriétaire</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#111827;font-size:18px;font-weight:700;">Invitation à rejoindre une équipe</h2>
            <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.6;">
              <strong style="color:#374151;">${inviterEmail}</strong> vous invite à rejoindre l'espace de travail
              <strong style="color:#374151;">${tenantName}</strong> sur CRM Propriétaire.
            </p>
            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
              Cliquez sur le bouton ci-dessous pour créer votre compte et accéder à l'espace partagé.
            </p>

            <a href="${acceptUrl}" style="display:block;text-align:center;padding:14px 24px;background:#4f46e5;color:#ffffff;font-weight:600;font-size:15px;border-radius:8px;text-decoration:none;">
              Rejoindre l'équipe
            </a>

            <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
              Ce lien expire dans 48 heures.<br>
              Si vous n'attendiez pas cette invitation, ignorez cet email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0;color:#d1d5db;font-size:11px;">
              CRM Propriétaire · Invitation à usage unique
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

        await this.transporter.sendMail({
            from: this.from,
            to,
            subject: `Invitation à rejoindre ${tenantName} sur CRM Propriétaire`,
            html,
        });

        this.logger.log(`Invitation email sent to ${to} for tenant ${tenantName}`);
    }

    async sendTaskOverdueReminder(to: string, taskTitle: string): Promise<void> {
        const html = `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#f59e0b;padding:24px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700;">⚠️ Tâche en retard</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
            La tâche suivante est en retard et n'a pas encore été complétée :
          </p>
          <div style="padding:16px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:24px;">
            <p style="margin:0;color:#92400e;font-size:14px;font-weight:600;">${taskTitle}</p>
          </div>
          <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
            Connectez-vous à votre CRM pour traiter cette tâche.
          </p>
        </td></tr>
        <tr><td style="padding:16px 40px;border-top:1px solid #f3f4f6;text-align:center;">
          <p style="margin:0;color:#d1d5db;font-size:11px;">CRM Propriétaire · Rappel automatique</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

        await this.transporter.sendMail({
            from: this.from,
            to,
            subject: `⚠️ Tâche en retard : ${taskTitle}`,
            html,
        });
        this.logger.log(`Task overdue reminder sent to ${to}`);
    }

    async sendInvoiceOverdueReminder(to: string, invoiceNumber: string, total: number): Promise<void> {
        const formattedTotal = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(total);
        const html = `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#dc2626;padding:24px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700;">🔴 Facture impayée</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
            La facture suivante est impayée depuis plus de 30 jours :
          </p>
          <div style="padding:16px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:24px;">
            <p style="margin:0 0 4px;color:#991b1b;font-size:14px;font-weight:700;">${invoiceNumber}</p>
            <p style="margin:0;color:#dc2626;font-size:20px;font-weight:700;">${formattedTotal}</p>
          </div>
          <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
            Connectez-vous à votre CRM pour relancer votre client.
          </p>
        </td></tr>
        <tr><td style="padding:16px 40px;border-top:1px solid #f3f4f6;text-align:center;">
          <p style="margin:0;color:#d1d5db;font-size:11px;">CRM Propriétaire · Rappel automatique</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

        await this.transporter.sendMail({
            from: this.from,
            to,
            subject: `🔴 Facture impayée : ${invoiceNumber} (${formattedTotal})`,
            html,
        });
        this.logger.log(`Invoice overdue reminder sent to ${to}`);
    }
}
