import { Module } from '@nestjs/common';
import { AgendaController } from './agenda.controller';
import { GetAgendaUseCase } from './application/use-cases/get-agenda.use-case';
import { PrismaModule } from '../../shared/infrastructure/prisma/prisma.module';
import { TaskModule } from '../task/task.module';
import { InteractionModule } from '../interaction/interaction.module';

@Module({
    imports: [
        PrismaModule,
        TaskModule,
        InteractionModule,
    ],
    controllers: [AgendaController],
    providers: [GetAgendaUseCase],
})
export class AgendaModule { }
