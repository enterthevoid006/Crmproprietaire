import { Controller, Post, Body, Get, Param, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { CreateActorUseCase, CreateActorRequest } from './application/use-cases/create-actor.use-case';
import { GetActorsUseCase } from './application/use-cases/get-actors.use-case';
import { GetActorByIdUseCase } from './application/use-cases/get-actor-by-id.use-case';
import { JwtAuthGuard } from '../iam/infrastructure/authentication/jwt-auth.guard';
import { ActorMapper } from './infrastructure/persistence/actor.mapper';

@Controller('actors')
@UseGuards(JwtAuthGuard)
export class ActorController {
    constructor(
        private readonly createActorUseCase: CreateActorUseCase,
        private readonly getActorsUseCase: GetActorsUseCase,
        private readonly getActorByIdUseCase: GetActorByIdUseCase,
    ) { }

    @Post()
    async create(@Body() request: CreateActorRequest) {
        const actor = await this.createActorUseCase.execute(request);
        return ActorMapper.toResponse(actor);
    }

    @Get()
    async findAll() {
        const actors = await this.getActorsUseCase.execute();
        return actors.map(ActorMapper.toResponse);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const actor = await this.getActorByIdUseCase.execute(id);
        if (!actor) {
            throw new NotFoundException(`Actor with ID ${id} not found`);
        }
        return ActorMapper.toResponse(actor);
    }
}
