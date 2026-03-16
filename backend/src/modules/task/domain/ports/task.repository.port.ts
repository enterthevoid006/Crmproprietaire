import { Task } from '../entities/task.entity';

export const TASK_REPOSITORY = 'TASK_REPOSITORY';

export interface TaskRepositoryPort {
    save(task: Task): Promise<void>;
    findAll(tenantId: string): Promise<Task[]>;
    findByOpportunityId(opportunityId: string): Promise<Task[]>;
    findById(id: string): Promise<Task | null>;
    delete(id: string): Promise<void>;
}
