import { Task, TaskProps, TaskStatus, TaskPriority } from '../../domain/entities/task.entity';
import { Task as PrismaTask } from '@prisma/client';

export class TaskMapper {
    static toDomain(raw: PrismaTask): Task {
        const props: TaskProps = {
            tenantId: raw.tenantId,
            actorId: raw.actorId,
            opportunityId: raw.opportunityId,
            title: raw.title,
            description: raw.description,
            status: raw.status as TaskStatus,
            priority: raw.priority as TaskPriority,
            dueDate: raw.dueDate,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            actor: (raw as any).actor ? {
                firstName: (raw as any).actor.firstName,
                lastName: (raw as any).actor.lastName,
                companyName: (raw as any).actor.companyName,
            } : undefined,
        };
        return (Task as any).create(props, raw.id);
    }

    static toPersistence(entity: Task): PrismaTask {
        const props = entity.getProps();
        return {
            id: entity.id,
            tenantId: props.tenantId,
            actorId: props.actorId || null,
            opportunityId: props.opportunityId || null,
            title: props.title,
            description: props.description || null,
            status: props.status,
            priority: props.priority,
            dueDate: props.dueDate || null,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
    }
}
