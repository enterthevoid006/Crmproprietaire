import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskPriority } from '../../domain/entities/task.entity';
import { TASK_REPOSITORY, type TaskRepositoryPort } from '../../domain/ports/task.repository.port';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class UpdateTaskRequest {
    @IsString()
    @IsOptional()
    title?: string;

    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @IsDateString()
    @IsOptional()
    dueDate?: string;
}

@Injectable()
export class UpdateTaskUseCase {
    constructor(
        @Inject(TASK_REPOSITORY) private taskRepo: TaskRepositoryPort,
    ) {}

    async execute(id: string, request: UpdateTaskRequest): Promise<Task> {
        const tenantId = TenantContext.getTenantIdOrThrow();
        const task = await this.taskRepo.findById(id);

        if (!task || task.getProps().tenantId !== tenantId) {
            throw new NotFoundException('Task not found');
        }

        if (request.title !== undefined)    (task as any).props.title    = request.title;
        if (request.priority !== undefined) (task as any).props.priority = request.priority;
        if (request.dueDate !== undefined)  (task as any).props.dueDate  = request.dueDate ? new Date(request.dueDate) : null;
        (task as any).props.updatedAt = new Date();

        await this.taskRepo.save(task);
        return task;
    }
}
