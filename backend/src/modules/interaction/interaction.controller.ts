import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CreateInteractionUseCase, CreateInteractionRequest } from './application/use-cases/create-interaction.use-case';
import { GetInteractionsUseCase, GetInteractionsFilter } from './application/use-cases/get-interactions.use-case';
import { UpdateInteractionUseCase, UpdateInteractionRequest } from './application/use-cases/update-interaction.use-case';
import { DeleteInteractionUseCase } from './application/use-cases/delete-interaction.use-case';
import { JwtAuthGuard } from '../iam/infrastructure/authentication/jwt-auth.guard';

@Controller('interactions')
@UseGuards(JwtAuthGuard)
export class InteractionController {
    constructor(
        private readonly createInteractionUseCase: CreateInteractionUseCase,
        private readonly getInteractionsUseCase: GetInteractionsUseCase,
        private readonly updateInteractionUseCase: UpdateInteractionUseCase,
        private readonly deleteInteractionUseCase: DeleteInteractionUseCase,
    ) { }

    @Post()
    async create(@Body() request: CreateInteractionRequest) {
        return this.createInteractionUseCase.execute(request);
    }

    @Get()
    async findAll(
        @Query('actorId') actorId?: string,
        @Query('opportunityId') opportunityId?: string,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
    ) {
        const filter: GetInteractionsFilter = {
            actorId: actorId || undefined,
            opportunityId: opportunityId || undefined,
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
        };
        const interactions = await this.getInteractionsUseCase.execute(filter);
        return interactions.map(i => ({
            id: i.id,
            ...i.getProps(),
        }));
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() request: UpdateInteractionRequest) {
        return this.updateInteractionUseCase.execute(id, request);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.deleteInteractionUseCase.execute(id);
    }
}
