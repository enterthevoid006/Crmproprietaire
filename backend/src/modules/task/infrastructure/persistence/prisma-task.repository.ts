import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { TaskRepositoryPort } from '../../domain/ports/task.repository.port';
import { Task } from '../../domain/entities/task.entity';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';
import { TaskMapper } from './task.mapper';

@Injectable()
export class PrismaTaskRepository implements TaskRepositoryPort {
    constructor(private prisma: PrismaService) { }

    async save(task: Task): Promise<void> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        if (task.getProps().tenantId !== tenantId) {
            throw new Error('Security Violation: Attempting to save task for different tenant');
        }

        const data = TaskMapper.toPersistence(task);

        await this.prisma.task.upsert({
            where: { id: task.id },
            update: { ...data } as any,
            create: { ...data } as any,
        });
    }

    async findById(id: string): Promise<Task | null> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        const raw = await this.prisma.task.findFirst({
            where: {
                id,
                tenantId
            },
        });

        if (!raw) return null;
        return TaskMapper.toDomain(raw);
    }

    async findAll(tenantId: string): Promise<Task[]> {
        // Use the tenantId passed from the interface or the context (context is stricter)
        // Ignoring the interface param if it differs from context for safety
        const contextTenantId = TenantContext.getTenantIdOrThrow();

        const rawTasks = await this.prisma.task.findMany({
            where: { tenantId: contextTenantId },
            orderBy: { dueDate: 'asc' }, // Order by due date
            include: { actor: true }
        });

        return rawTasks.map(t => TaskMapper.toDomain(t as any));
    }

    async delete(id: string): Promise<void> {
        const tenantId = TenantContext.getTenantIdOrThrow();
        // Ensure the task belongs to the tenant before deleting
        // DeleteMany with count check is safer than delete() which throws if not found
        // OR findFirst then delete.

        // Simple approach: deleteMany where id AND tenantId matches.
        const result = await this.prisma.task.deleteMany({
            where: {
                id,
                tenantId
            }
        });

        if (result.count === 0) {
            // Optional: throw NotFoundException or silently ignore
            // For idempotency, silent is okay, but for UI feedback, throwing might be better.
            // Let's assume silent success for now.
        }
    }
}
