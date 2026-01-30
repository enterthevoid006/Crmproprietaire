import api from '../../../lib/api';

export type Interaction = {
    id: string;
    tenantId: string;
    actorId?: string;
    opportunityId?: string;
    actor?: { firstName?: string; lastName?: string; companyName?: string };
    type: 'EMAIL' | 'CALL' | 'MEETING' | 'NOTE' | 'OTHER';
    summary: string;
    details?: string;
    date: string;
    createdAt: string;
    updatedAt: string;
};

export type CreateInteractionDTO = {
    type: Interaction['type'];
    summary: string;
    details?: string;
    date?: string;
    actorId?: string;
    opportunityId?: string;
};

export const InteractionService = {
    getByActor: async (actorId: string): Promise<Interaction[]> => {
        const response = await api.get<Interaction[]>(`/interactions?actorId=${actorId}`);
        return response.data;
    },

    getByOpportunity: async (opportunityId: string): Promise<Interaction[]> => {
        const response = await api.get<Interaction[]>(`/interactions?opportunityId=${opportunityId}`);
        return response.data;
    },

    create: async (data: CreateInteractionDTO): Promise<Interaction> => {
        const response = await api.post<Interaction>('/interactions', data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/interactions/${id}`);
    }
};
