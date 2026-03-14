import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { CreateOpportunityUseCase, CreateOpportunityRequest } from './application/use-cases/create-opportunity.use-case';
import { UpdateOpportunityUseCase, UpdateOpportunityRequest } from './application/use-cases/update-opportunity.use-case';
import { GetOpportunitiesUseCase } from './application/use-cases/get-opportunities.use-case';
import { JwtAuthGuard } from '../iam/infrastructure/authentication/jwt-auth.guard';

@Controller('opportunities')
@UseGuards(JwtAuthGuard)
export class OpportunityController {
    constructor(
        private readonly createOpportunityUseCase: CreateOpportunityUseCase,
        private readonly updateOpportunityUseCase: UpdateOpportunityUseCase,
        private readonly getOpportunitiesUseCase: GetOpportunitiesUseCase,
    ) { }

    @Post()
    async create(@Body() request: CreateOpportunityRequest) {
        return this.createOpportunityUseCase.execute(request);
    }

    @Get()
    async findAll() {
        const results = await this.getOpportunitiesUseCase.execute();

        return results.map(op => ({
            id: op.id,
            ...op.getProps(),
        }));
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() request: UpdateOpportunityRequest) {
        return this.updateOpportunityUseCase.execute(id, request);
    }
}
