import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Opportunity, OpportunityStage } from '../../domain/entities/opportunity.entity';
import { OPPORTUNITY_REPOSITORY, type OpportunityRepositoryPort } from '../../domain/ports/opportunity.repository.port';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';

import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';

export class UpdateOpportunityRequest {
    @IsString()
    @IsOptional()
    name?: string;

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
export class UpdateOpportunityUseCase {
    constructor(
        @Inject(OPPORTUNITY_REPOSITORY) private opportunityRepo: OpportunityRepositoryPort,
    ) { }

    async execute(id: string, request: UpdateOpportunityRequest): Promise<Opportunity> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        // 1. Get existing
        const opportunity = await this.opportunityRepo.findById(id);
        if (!opportunity) {
            throw new NotFoundException(`Opportunity ${id} not found`);
        }

        if (opportunity.getProps().tenantId !== tenantId) {
            throw new NotFoundException(`Opportunity ${id} not found`);
        }

        // 2. Update props (Naive implementation: mutating props directly or recreating)
        // Ideally we should have methods on the Entity like "changeStage", "updateFinancials"
        const currentProps = opportunity.getProps();

        const updatedProps = {
            ...currentProps,
            name: request.name ?? currentProps.name,
            amount: request.amount ?? currentProps.amount,
            stage: request.stage ?? currentProps.stage,
            probability: request.probability ?? currentProps.probability,
            expectedCloseDate: request.expectedCloseDate !== undefined ? request.expectedCloseDate : currentProps.expectedCloseDate,
            closeDate: request.closeDate !== undefined ? request.closeDate : currentProps.closeDate,
            updatedAt: new Date(),
        };

        // Reconstruct entity (simplest way without setter methods on Domain Entity)
        // We use "as any" or a specific reconstructor if enforced. 
        // Since we are inside the backend and know strictly what we do, and our Entity constructor is private,
        // we might need to expose a method or Use Reflection/Mapper pattern.
        // BUT: The mapper uses (Opportunity as any).create() to bypass check logic when hydrating.
        // For Update, we should ideally reuse the Entity methods. 
        // Let's create a new instance with the ID preserved.

        const updatedOpportunity = (Opportunity as any).create(updatedProps, id);

        // 3. Save
        await this.opportunityRepo.save(updatedOpportunity);

        return {
            id: updatedOpportunity.id,
            ...updatedOpportunity.getProps(),
        } as any;
    }
}
