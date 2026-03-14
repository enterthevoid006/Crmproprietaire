import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationService {
    constructor(private readonly prisma: PrismaService) {}

    async getUnread(userId: string, tenantId: string) {
        return this.prisma.notification.findMany({
            where: { userId, tenantId, read: false },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async markRead(id: string, userId: string) {
        return this.prisma.notification.updateMany({
            where: { id, userId },
            data: { read: true },
        });
    }

    async markAllRead(userId: string, tenantId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, tenantId, read: false },
            data: { read: true },
        });
    }

    /**
     * Creates a notification only if no unread notification
     * already exists for the same user + type + resource.
     * Returns true if a new notification was created.
     */
    async createIfNotExists(data: {
        tenantId: string;
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        resourceId?: string;
        resourceType?: string;
    }): Promise<boolean> {
        if (data.resourceId) {
            const existing = await this.prisma.notification.findFirst({
                where: {
                    userId: data.userId,
                    tenantId: data.tenantId,
                    type: data.type,
                    resourceId: data.resourceId,
                },
            });
            if (existing) return false;
        }

        await this.prisma.notification.create({ data });
        return true;
    }
}
