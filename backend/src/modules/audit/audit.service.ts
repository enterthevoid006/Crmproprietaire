import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface AuditLogDTO {
    tenantId: string;
    userId?: string;
    userEmail?: string;
    ipAddress?: string;
    userAgent?: string;
    entity: string;
    entityId: string;
    action: string;
    oldValue?: any;
    newValue?: any;
}

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async log(data: AuditLogDTO): Promise<void> {
        await this.prisma.auditLog.create({
            data: {
                tenantId: data.tenantId,
                userId: data.userId,
                userEmail: data.userEmail,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                entity: data.entity,
                entityId: data.entityId,
                action: data.action,
                oldValue: data.oldValue ?? Prisma.JsonNull,
                newValue: data.newValue ?? Prisma.JsonNull,
            } as any,
        });
    }
}
