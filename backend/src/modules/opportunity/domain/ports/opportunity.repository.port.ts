import { Opportunity } from '../entities/opportunity.entity';

export const OPPORTUNITY_REPOSITORY = 'OPPORTUNITY_REPOSITORY';

export interface OpportunityRepositoryPort {
    save(opportunity: Opportunity): Promise<void>;
    findAll(limit?: number, offset?: number): Promise<Opportunity[]>;
    findById(id: string): Promise<Opportunity | null>;
}
