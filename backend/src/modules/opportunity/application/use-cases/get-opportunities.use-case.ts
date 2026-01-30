import { Inject, Injectable } from '@nestjs/common';
import { Opportunity } from '../../domain/entities/opportunity.entity';
import { OPPORTUNITY_REPOSITORY, type OpportunityRepositoryPort } from '../../domain/ports/opportunity.repository.port';

@Injectable()
export class GetOpportunitiesUseCase {
    constructor(
        @Inject(OPPORTUNITY_REPOSITORY) private opportunityRepo: OpportunityRepositoryPort,
    ) { }

    async execute(limit: number = 50, offset: number = 0): Promise<Opportunity[]> {
        return this.opportunityRepo.findAll(limit, offset);
    }
}
