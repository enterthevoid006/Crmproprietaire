import { Inject, Injectable } from '@nestjs/common';
import { Task } from '../../domain/entities/task.entity';
import { TASK_REPOSITORY, type TaskRepositoryPort } from '../../domain/ports/task.repository.port';

import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';

@Injectable()
export class GetTasksUseCase {
    constructor(
        @Inject(TASK_REPOSITORY) private taskRepo: TaskRepositoryPort,
    ) { }

    async execute(filter?: { opportunityId?: string }): Promise<Task[]> {
        const tenantId = TenantContext.getTenantIdOrThrow();
        if (filter?.opportunityId) {
            return this.taskRepo.findByOpportunityId(filter.opportunityId);
        }
        return this.taskRepo.findAll(tenantId);
    }
}
