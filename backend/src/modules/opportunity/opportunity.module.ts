import { Module } from '@nestjs/common';
import { OpportunityController } from './opportunity.controller';
import { CreateOpportunityUseCase } from './application/use-cases/create-opportunity.use-case';
import { UpdateOpportunityUseCase } from './application/use-cases/update-opportunity.use-case';
import { GetOpportunitiesUseCase } from './application/use-cases/get-opportunities.use-case';
import { PrismaOpportunityRepository } from './infrastructure/persistence/prisma-opportunity.repository';
import { OPPORTUNITY_REPOSITORY } from './domain/ports/opportunity.repository.port';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';

@Module({
    controllers: [OpportunityController],
    providers: [
        PrismaService,
        CreateOpportunityUseCase,
        UpdateOpportunityUseCase,
        GetOpportunitiesUseCase,
        {
            provide: OPPORTUNITY_REPOSITORY,
            useClass: PrismaOpportunityRepository,
        },
    ],
})
export class OpportunityModule { }
