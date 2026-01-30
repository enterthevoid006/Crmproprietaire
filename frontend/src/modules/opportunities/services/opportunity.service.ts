import api from '../../../lib/api';

export type Opportunity = {
    id: string;
    tenantId: string;
    actorId: string;
    actor: { firstName?: string; lastName?: string; companyName?: string };
    name: string;
    amount: number;
    stage: 'NEW' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
    probability: number;
    expectedCloseDate?: string;
    closeDate?: string;
    createdAt: string;
    updatedAt: string;
};

export type CreateOpportunityDTO = {
    actorId: string;
    name: string;
    amount?: number;
    stage?: Opportunity['stage'];
    probability?: number;
    expectedCloseDate?: string;
    closeDate?: string;
};

export const OpportunityService = {
    getAll: async (): Promise<Opportunity[]> => {
        const response = await api.get<Opportunity[]>('/opportunities');
        return response.data;
    },

    create: async (data: CreateOpportunityDTO): Promise<Opportunity> => {
        const response = await api.post<Opportunity>('/opportunities', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateOpportunityDTO>): Promise<Opportunity> => {
        const response = await api.patch<Opportunity>(`/opportunities/${id}`, data);
        return response.data;
    },

    getById: async (id: string): Promise<Opportunity> => {
        // We reuse the list endpoint logic but we probably need a dedicated endpoint or filter.
        // For MVP, if backend doesn't support getById, we might need to fetch all and find, but ideally we add an endpoint.
        // Checking backend controller... it probably doesn't have a specific getById endpoint.
        // Adding one temporarily or assuming getAll works.
        // Wait, standard CRUD usually has it. Let's check backend controller from memory/context.
        // It has @Get() findAll, @Post(), @Patch(:id). It MISSES @Get(:id).
        // I will implement a fetch-all-and-find fallback for now to avoid blocking on backend, 
        // OR I can quickly add @Get(:id) to backend. 
        // Let's check if the backend has it. 
        // Backend OpportunityController only has findAll, create, update. NO getOne.
        // So I will modify this to use getAll and filter client-side for now to be safe and fast,
        // unless list is huge.
        const all = await OpportunityService.getAll();
        const found = all.find(o => o.id === id);
        if (!found) throw new Error('Opportunity not found');
        return found;
    }
};
