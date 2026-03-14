import api from '../../../lib/api';

// export enum ActorType {
//     INDIVIDUAL = 'INDIVIDUAL',
//     CORPORATE = 'CORPORATE',
// }
export const ActorType = {
    INDIVIDUAL: 'INDIVIDUAL',
    CORPORATE: 'CORPORATE',
} as const;

export type ActorType = typeof ActorType[keyof typeof ActorType];

export interface Actor {
    id: string;
    tenantId: string;
    type: ActorType;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    email?: string;
    phone?: string;
    address?: string;
    source?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateActorDTO {
    type: ActorType;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    email?: string;
    phone?: string;
    address?: string;
    source?: string;
    tags?: string[];
}

export const ActorService = {
    getAll: async (): Promise<Actor[]> => {
        const response = await api.get<Actor[]>('/actors');
        return response.data;
    },

    create: async (data: CreateActorDTO): Promise<Actor> => {
        const response = await api.post<Actor>('/actors', data);
        return response.data;
    },

    getById: async (id: string): Promise<Actor> => {
        const response = await api.get<Actor>(`/actors/${id}`);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateActorDTO>): Promise<Actor> => {
        const response = await api.patch<Actor>(`/actors/${id}`, data);
        return response.data;
    },
};
