import api from '../../../lib/api';

export const InvoiceStatus = {
    DRAFT: 'DRAFT',
    SENT: 'SENT',
    PAID: 'PAID',
    OVERDUE: 'OVERDUE',
    CANCELLED: 'CANCELLED'
} as const;

export type InvoiceStatus = typeof InvoiceStatus[keyof typeof InvoiceStatus];

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Invoice {
    id: string;
    number: string;
    date: string;
    dueDate: string;
    status: InvoiceStatus;
    items: InvoiceItem[];
    subtotal: number;
    taxAmount: number;
    total: number;
    actorId: string;
    opportunityId?: string;
    createdAt: string;
}

export interface CreateInvoiceData {
    actorId: string;
    opportunityId?: string;
    items: InvoiceItem[];
    dueDate?: string;
}

export const InvoiceService = {
    getAll: async (filters: { actorId?: string; opportunityId?: string }): Promise<Invoice[]> => {
        const response = await api.get<Invoice[]>('/invoices', { params: filters });
        return response.data;
    },

    create: async (data: CreateInvoiceData): Promise<Invoice> => {
        const response = await api.post<Invoice>('/invoices', data);
        return response.data;
    },

    getById: async (id: string): Promise<Invoice> => {
        // We can reuse getAll since we don't have a specific getById endpoint in controller yet?
        // Wait, Controller DOES NOT have getById mapped individually in FindAll? 
        // Actually FinanceController usually needs a Get(':id') for details.
        // Let's check FinanceController... it ONLY has findAll(@Query) and updateStatus.
        // I need to add GetById to Controller too!
        // For now, I'll filter client side or quickly add the endpoint. 
        // Added endpoint previously? No, I added Patch status. I see Get() findAll.
        // I will add Get(':id') to Controller first.
        const response = await api.get<Invoice>(`/invoices/${id}`);
        return response.data;
    },

    updateStatus: async (id: string, status: InvoiceStatus): Promise<void> => {
        await api.patch(`/invoices/${id}/status`, { status });
    },

    downloadPdf: async (id: string): Promise<void> => {
        const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};
