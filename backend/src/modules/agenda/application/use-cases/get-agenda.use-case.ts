import { Inject, Injectable } from '@nestjs/common';
import { CalendarEvent, CalendarEventType } from '../../domain/interfaces/calendar-event.interface';
import { TASK_REPOSITORY, type TaskRepositoryPort } from '../../../task/domain/ports/task.repository.port';
import { INTERACTION_REPOSITORY, type InteractionRepositoryPort } from '../../../interaction/domain/ports/interaction.repository.port';
import { InteractionType } from '../../../interaction/domain/entities/interaction.entity';

import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';

@Injectable()
export class GetAgendaUseCase {
    constructor(
        @Inject(TASK_REPOSITORY) private taskRepo: TaskRepositoryPort,
        @Inject(INTERACTION_REPOSITORY) private interactionRepo: InteractionRepositoryPort,
    ) { }

    async execute(start: Date, end: Date): Promise<CalendarEvent[]> {
        const tenantId = TenantContext.getTenantIdOrThrow();
        // In a real app we would pass filters to repo. here we fetch all and filter in memory for prototype speed
        // TODO: Optimize with repo filters

        const tasks = await this.taskRepo.findAll(tenantId);
        // InteractionRepo also needs tenantId if we changed it, probably yes or it just uses context internally?
        // Let's check InteractionRepo. It seems it DOES NOT take tenantId in findAll yet or I changed it?
        // I changed InteractionRepo to accept limit/offset, waiting.
        // Actually I reviewed PrismaInteractionRepository and it uses TenantContext internally for findAll. 
        // Wait, did I change InteractionRepositoryPort.findAll?
        // Let's double check. If I didn't change the port, I don't need to change the call.
        // But for consistency I should probably make them explicit.

        // Checking my memory/history: 
        // PrismaInteractionRepository.findAll DOES call TenantContext.getTenantIdOrThrow() internally.
        // But the Port signature: findAll(limit?: number, offset?: number): Promise<Interaction[]>;
        // So I don't need to pass tenantId to interactionRepo.findAll().

        const interactions = await this.interactionRepo.findAll();

        const events: CalendarEvent[] = [];

        // 1. Process Tasks
        tasks.forEach(task => {
            const props = task.getProps();
            if (props.dueDate) {
                const due = new Date(props.dueDate);
                // Simple filter
                if (due >= start && due <= end) {
                    events.push({
                        id: task.id,
                        title: `[Tâche] ${props.title}`,
                        start: due,
                        type: CalendarEventType.TASK,
                        metadata: {
                            status: props.status,
                            actorId: props.actorId || undefined,
                            opportunityId: props.opportunityId || undefined,
                        }
                    });
                }
            }
        });

        // 2. Process Interactions (Meetings/Calls)
        interactions.forEach(interaction => {
            const props = interaction.getProps();
            if ([InteractionType.MEETING, InteractionType.CALL].includes(props.type)) {
                const date = new Date(props.date);
                if (date >= start && date <= end) {
                    events.push({
                        id: interaction.id,
                        title: `[${props.type}] ${props.summary}`,
                        start: date,
                        // Default duration 1 hour for meetings if no end date
                        end: new Date(date.getTime() + 60 * 60 * 1000),
                        type: props.type === InteractionType.CALL ? CalendarEventType.CALL : CalendarEventType.MEETING,
                        metadata: {
                            actorId: props.actorId || undefined,
                            opportunityId: props.opportunityId || undefined,
                        }
                    });
                }
            }
        });

        return events.sort((a, b) => a.start.getTime() - b.start.getTime());
    }
}
