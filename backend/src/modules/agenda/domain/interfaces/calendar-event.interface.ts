export enum CalendarEventType {
    TASK = 'TASK',
    MEETING = 'MEETING',
    CALL = 'CALL',
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end?: Date;
    type: CalendarEventType;
    metadata: {
        actorId?: string;
        opportunityId?: string;
        status?: string; // For tasks
    };
}
