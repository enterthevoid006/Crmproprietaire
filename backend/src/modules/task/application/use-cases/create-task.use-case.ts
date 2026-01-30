import { Inject, Injectable } from '@nestjs/common';
import { Task, TaskStatus, TaskPriority } from '../../domain/entities/task.entity';
import { TASK_REPOSITORY, type TaskRepositoryPort } from '../../domain/ports/task.repository.port';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';
import { IsString, IsOptional, IsNotEmpty, IsDateString, IsEnum } from 'class-validator';

export class CreateTaskRequest {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsOptional()
    dueDate?: Date;

    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @IsString()
    @IsOptional()
    actorId?: string;

    @IsString()
    @IsOptional()
    opportunityId?: string;
}

@Injectable()
export class CreateTaskUseCase {
    constructor(
        @Inject(TASK_REPOSITORY) private taskRepo: TaskRepositoryPort,
    ) { }

    async execute(request: CreateTaskRequest) {
        const tenantId = TenantContext.getTenantIdOrThrow();

        const task = Task.create({
            tenantId,
            title: request.title,
            description: request.description || null,
            dueDate: request.dueDate ? new Date(request.dueDate) : null,
            priority: request.priority || TaskPriority.MEDIUM,
            status: TaskStatus.TODO,
            actorId: request.actorId || null,
            opportunityId: request.opportunityId || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await this.taskRepo.save(task);

        // Return serializable object
        return {
            id: task.id,
            ...task.getProps(),
        };
    }
}
