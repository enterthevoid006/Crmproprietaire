import { Inject, Injectable } from '@nestjs/common';
import { Task, TaskStatus } from '../../domain/entities/task.entity';
import { TASK_REPOSITORY, type TaskRepositoryPort } from '../../domain/ports/task.repository.port';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';

@Injectable()
export class UpdateTaskStatusUseCase {
    constructor(
        @Inject(TASK_REPOSITORY) private taskRepo: TaskRepositoryPort,
    ) { }

    async execute(id: string, status: TaskStatus): Promise<Task> {
        const tenantId = TenantContext.getTenantIdOrThrow();
        const task = await this.taskRepo.findById(id);

        if (!task) throw new Error('Task not found');
        if (task.getProps().tenantId !== tenantId) throw new Error('Task not found');

        // Hacky mutation for now since entity doesn't expose setters yet in my simple version
        // Ideally: task.updateStatus(status);
        // But Entity base class usually requires recreating or we add a method.
        // Let's replicate "Reconstitution" or just update props for persistence.

        // Actually, let's just cheat for speed and update via Repo directly or add method.
        // I'll update the repo save to handle updates (it uses upsert).

        // We need to mutate the task entity.
        (task as any).props.status = status;
        (task as any).props.updatedAt = new Date();

        await this.taskRepo.save(task);
        return task;
    }
}
