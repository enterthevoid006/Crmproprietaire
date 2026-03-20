import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CreateTaskUseCase, CreateTaskRequest } from './application/use-cases/create-task.use-case';
import { GetTasksUseCase } from './application/use-cases/get-tasks.use-case';
import { UpdateTaskStatusUseCase } from './application/use-cases/update-task-status.use-case';
import { UpdateTaskUseCase, UpdateTaskRequest } from './application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from './application/use-cases/delete-task.use-case';
import { JwtAuthGuard } from '../iam/infrastructure/authentication/jwt-auth.guard';
import { TaskStatus } from './domain/entities/task.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
    constructor(
        private readonly createTaskUseCase: CreateTaskUseCase,
        private readonly getTasksUseCase: GetTasksUseCase,
        private readonly updateTaskStatusUseCase: UpdateTaskStatusUseCase,
        private readonly updateTaskUseCase: UpdateTaskUseCase,
        private readonly deleteTaskUseCase: DeleteTaskUseCase,
    ) { }

    @Post()
    async create(@Body() request: CreateTaskRequest) {
        return this.createTaskUseCase.execute(request);
    }

    @Get()
    async findAll(@Query('opportunityId') opportunityId?: string) {
        const tasks = await this.getTasksUseCase.execute({ opportunityId });
        return tasks.map(t => ({
            id: t.id,
            ...t.getProps()
        }));
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: TaskStatus) {
        const task = await this.updateTaskStatusUseCase.execute(id, status);
        return { id: task.id, ...task.getProps() };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() request: UpdateTaskRequest) {
        const task = await this.updateTaskUseCase.execute(id, request);
        return { id: task.id, ...task.getProps() };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.deleteTaskUseCase.execute(id);
    }
}
