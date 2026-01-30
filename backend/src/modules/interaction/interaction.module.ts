import { Module } from '@nestjs/common';
import { InteractionController } from './interaction.controller';
import { CreateInteractionUseCase } from './application/use-cases/create-interaction.use-case';
import { GetInteractionsUseCase } from './application/use-cases/get-interactions.use-case';
import { DeleteInteractionUseCase } from './application/use-cases/delete-interaction.use-case';
import { PrismaInteractionRepository } from './infrastructure/persistence/prisma-interaction.repository';
import { INTERACTION_REPOSITORY } from './domain/ports/interaction.repository.port';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';

@Module({
    controllers: [InteractionController],
    providers: [
        PrismaService,
        CreateInteractionUseCase,
        CreateInteractionUseCase,
        GetInteractionsUseCase,
        DeleteInteractionUseCase,
        {
            provide: INTERACTION_REPOSITORY,
            useClass: PrismaInteractionRepository,
        },
    ],
    exports: [INTERACTION_REPOSITORY],
})
export class InteractionModule { }
