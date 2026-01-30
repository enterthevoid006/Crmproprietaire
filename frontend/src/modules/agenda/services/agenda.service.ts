import api from '../../../lib/api';

export const CalendarEventType = {
    TASK: 'TASK',
    MEETING: 'MEETING',
    CALL: 'CALL',
    EMAIL: 'EMAIL',
} as const;

export type CalendarEventType = typeof CalendarEventType[keyof typeof CalendarEventType];

export interface CalendarEvent {
    id: string;
    title: string;
    start: string; // ISO Date
    end?: string; // ISO Date
    type: CalendarEventType;
    metadata?: {
        status?: string;
        actorId?: string;
        opportunityId?: string;
    }
}

export const agendaService = {
    getAgenda: async (start: Date, end: Date): Promise<CalendarEvent[]> => {
        const response = await api.get<CalendarEvent[]>('/agenda', {
            params: {
                start: start.toISOString(),
                end: end.toISOString(),
            }
        });
        return response.data;
    }
};
