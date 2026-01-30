import { Module } from '@nestjs/common';
import { ActorController } from './actor.controller';
import { CreateActorUseCase } from './application/use-cases/create-actor.use-case';
import { GetActorsUseCase } from './application/use-cases/get-actors.use-case';
import { GetActorByIdUseCase } from './application/use-cases/get-actor-by-id.use-case';
import { PrismaActorRepository } from './infrastructure/persistence/prisma-actor.repository';
import { ACTOR_REPOSITORY } from './domain/ports/actor.repository.port';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';

@Module({
    controllers: [ActorController],
    providers: [
        PrismaService,
        CreateActorUseCase,
        GetActorsUseCase,
        GetActorByIdUseCase,
        {
            provide: ACTOR_REPOSITORY,
            useClass: PrismaActorRepository,
        },
    ],
    exports: [],
})
export class ActorModule { }
