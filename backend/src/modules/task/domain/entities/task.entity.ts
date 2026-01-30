import { Entity } from '../../../core/domain/entity';

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

export enum TaskPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

export interface TaskProps {
    tenantId: string;
    actorId?: string | null;
    opportunityId?: string | null;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    actor?: {
        firstName?: string;
        lastName?: string;
        companyName?: string;
    };
}

export class Task extends Entity<TaskProps> {
    private constructor(props: TaskProps, id?: string) {
        super(props, id);
    }

    static create(props: TaskProps, id?: string): Task {
        if (!props.title) throw new Error('Title is required');

        return new Task({
            ...props,
            status: props.status || TaskStatus.TODO,
            priority: props.priority || TaskPriority.MEDIUM,
        }, id);
    }
}
