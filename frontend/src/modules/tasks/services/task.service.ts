import api from '../../../lib/api';

export type Task = {
    id: string;
    tenantId: string;
    actorId?: string;
    opportunityId?: string;
    title: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
    actor?: {
        firstName?: string;
        lastName?: string;
        companyName?: string;
    };
};

export type CreateTaskDTO = {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: Task['priority'];
    actorId?: string;
    opportunityId?: string;
};

export const TaskService = {
    getAll: async (): Promise<Task[]> => {
        const response = await api.get<Task[]>('/tasks');
        return response.data;
    },

    getByOpportunity: async (opportunityId: string): Promise<Task[]> => {
        const response = await api.get<Task[]>(`/tasks?opportunityId=${opportunityId}`);
        return response.data;
    },

    create: async (data: CreateTaskDTO): Promise<Task> => {
        const response = await api.post<Task>('/tasks', data);
        return response.data;
    },

    updateStatus: async (id: string, status: Task['status']): Promise<Task> => {
        const response = await api.patch<Task>(`/tasks/${id}/status`, { status });
        return response.data;
    },

    update: async (id: string, data: { title?: string; priority?: Task['priority']; dueDate?: string }): Promise<Task> => {
        const response = await api.patch<Task>(`/tasks/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/tasks/${id}`);
    }
};
