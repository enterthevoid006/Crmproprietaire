import { Controller, Post, Body, Get, Param, Patch, UseGuards, NotFoundException, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateActorUseCase, CreateActorRequest } from './application/use-cases/create-actor.use-case';
import { GetActorsUseCase } from './application/use-cases/get-actors.use-case';
import { GetActorByIdUseCase } from './application/use-cases/get-actor-by-id.use-case';
import { UpdateActorUseCase, UpdateActorRequest } from './application/use-cases/update-actor.use-case';
import { ImportCsvUseCase } from './application/use-cases/import-csv.use-case';
import { JwtAuthGuard } from '../iam/infrastructure/authentication/jwt-auth.guard';
import { ActorMapper } from './infrastructure/persistence/actor.mapper';

@Controller('actors')
@UseGuards(JwtAuthGuard)
export class ActorController {
    constructor(
        private readonly createActorUseCase: CreateActorUseCase,
        private readonly getActorsUseCase: GetActorsUseCase,
        private readonly getActorByIdUseCase: GetActorByIdUseCase,
        private readonly updateActorUseCase: UpdateActorUseCase,
        private readonly importCsvUseCase: ImportCsvUseCase,
    ) { }

    @Post('import-csv')
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    async importCsv(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Aucun fichier fourni.');
        }
        if (!file.originalname.toLowerCase().endsWith('.csv') && file.mimetype !== 'text/csv') {
            throw new BadRequestException('Le fichier doit être au format CSV.');
        }
        try {
            return await this.importCsvUseCase.execute(file.buffer);
        } catch (err: any) {
            throw new BadRequestException(err?.message ?? 'Erreur lors de l\'import.');
        }
    }

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

    @Patch(':id')
    async update(@Param('id') id: string, @Body() request: UpdateActorRequest) {
        const actor = await this.updateActorUseCase.execute(id, request);
        return ActorMapper.toResponse(actor);
    }
}
