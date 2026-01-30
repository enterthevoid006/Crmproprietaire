import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetAgendaUseCase } from './application/use-cases/get-agenda.use-case';
import { JwtAuthGuard } from '../iam/infrastructure/authentication/jwt-auth.guard';

@Controller('agenda')
@UseGuards(JwtAuthGuard)
export class AgendaController {
    constructor(
        private readonly getAgendaUseCase: GetAgendaUseCase,
    ) { }

    @Get()
    async getAgenda(
        @Query('start') startStr?: string,
        @Query('end') endStr?: string,
    ) {
        // Default to current month if not specified
        const start = startStr ? new Date(startStr) : new Date(new Date().setDate(1)); // 1st of month
        const end = endStr ? new Date(endStr) : new Date(new Date().setMonth(new Date().getMonth() + 1)); // Next month

        return this.getAgendaUseCase.execute(start, end);
    }
}
