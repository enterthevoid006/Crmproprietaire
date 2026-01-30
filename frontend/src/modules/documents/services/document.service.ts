import api from '../../../lib/api';

export interface Document {
    id: string;
    filename: string;
    path: string;
    mimeType: string;
    size: number;
    createdAt: string;
    actorId?: string;
    opportunityId?: string;
}

export const DocumentService = {
    getAll: async (filters: { actorId?: string; opportunityId?: string }): Promise<Document[]> => {
        const response = await api.get<Document[]>('/documents', { params: filters });
        return response.data;
    },

    upload: async (file: File, context: { actorId?: string; opportunityId?: string }): Promise<Document> => {
        const formData = new FormData();
        formData.append('file', file);
        if (context.actorId) formData.append('actorId', context.actorId);
        if (context.opportunityId) formData.append('opportunityId', context.opportunityId);

        const response = await api.post<Document>('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/documents/${id}`);
    }
};
