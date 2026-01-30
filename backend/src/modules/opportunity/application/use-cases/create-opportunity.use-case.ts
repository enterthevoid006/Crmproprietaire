import { Inject, Injectable } from '@nestjs/common';
import { Opportunity, OpportunityStage } from '../../domain/entities/opportunity.entity';
import { OPPORTUNITY_REPOSITORY, type OpportunityRepositoryPort } from '../../domain/ports/opportunity.repository.port';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';

import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';

export class CreateOpportunityRequest {
    @IsString()
    actorId!: string;

    @IsString()
    name!: string;

    @IsNumber()
    @IsOptional()
    amount?: number;

    @IsEnum(OpportunityStage)
    @IsOptional()
    stage?: OpportunityStage;

    @IsNumber()
    @IsOptional()
    probability?: number;

    @IsDateString()
    @IsOptional()
    expectedCloseDate?: Date;

    @IsDateString()
    @IsOptional()
    closeDate?: Date;
}

@Injectable()
export class CreateOpportunityUseCase {
    constructor(
        @Inject(OPPORTUNITY_REPOSITORY) private opportunityRepo: OpportunityRepositoryPort,
    ) { }

    async execute(request: CreateOpportunityRequest): Promise<Opportunity> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        const opportunity = Opportunity.create({
            tenantId,
            actorId: request.actorId,
            name: request.name,
            amount: request.amount || 0,
            stage: request.stage || OpportunityStage.NEW,
            probability: request.probability || 0,
            expectedCloseDate: request.expectedCloseDate || null,
            closeDate: request.closeDate || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await this.opportunityRepo.save(opportunity);
        // Return serializable object
        return {
            id: opportunity.id,
            ...opportunity.getProps(),
        } as any;
    }
}
