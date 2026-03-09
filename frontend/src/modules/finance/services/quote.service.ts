import api from '../../../lib/api';

export const QuoteStatus = {
    DRAFT: 'DRAFT',
    SENT: 'SENT',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    EXPIRED: 'EXPIRED'
} as const;

export type QuoteStatus = typeof QuoteStatus[keyof typeof QuoteStatus];

export interface QuoteItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Quote {
    id: string;
    number: string;
    date: string;
    validUntil: string;
    status: QuoteStatus;
    items: QuoteItem[];
    subtotal: number;
    taxAmount: number;
    total: number;
    actorId: string;
    actorName?: string;
    opportunityId?: string;
    createdAt: string;
}

export interface CreateQuoteData {
    actorId: string;
    opportunityId?: string;
    items: QuoteItem[];
    validUntil?: string;
}

export const QuoteService = {
    getAll: async (filters: { actorId?: string; opportunityId?: string }): Promise<Quote[]> => {
        const response = await api.get<Quote[]>('/invoices/quotes', { params: filters });
        return response.data;
    },

    create: async (data: CreateQuoteData): Promise<Quote> => {
        const response = await api.post<Quote>('/invoices/quotes', data);
        return response.data;
    },

    getById: async (id: string): Promise<Quote> => {
        const response = await api.get<Quote>(`/invoices/quotes/${id}`);
        return response.data;
    },

    updateStatus: async (id: string, status: QuoteStatus): Promise<void> => {
        await api.patch(`/invoices/quotes/${id}/status`, { status });
    },

    downloadPdf: async (id: string): Promise<void> => {
        const response = await api.get(`/invoices/quotes/${id}/pdf`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `quote-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};
