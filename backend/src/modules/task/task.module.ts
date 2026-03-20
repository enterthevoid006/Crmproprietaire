import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { GetTasksUseCase } from './application/use-cases/get-tasks.use-case';
import { UpdateTaskStatusUseCase } from './application/use-cases/update-task-status.use-case';
import { UpdateTaskUseCase } from './application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from './application/use-cases/delete-task.use-case';
import { PrismaTaskRepository } from './infrastructure/persistence/prisma-task.repository';
import { TASK_REPOSITORY } from './domain/ports/task.repository.port';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';

@Module({
    controllers: [TaskController],
    providers: [
        PrismaService,
        CreateTaskUseCase,
        GetTasksUseCase,
        UpdateTaskStatusUseCase,
        UpdateTaskUseCase,
        DeleteTaskUseCase,
        {
            provide: TASK_REPOSITORY,
            useClass: PrismaTaskRepository,
        },
    ],
    exports: [TASK_REPOSITORY],
})
export class TaskModule { }
