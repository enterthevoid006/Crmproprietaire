import { Invoice } from '../entities/invoice.entity';

export const INVOICE_REPOSITORY = 'INVOICE_REPOSITORY';

export interface InvoiceRepositoryPort {
    save(invoice: Invoice): Promise<Invoice>;
    findAll(tenantId: string, filters?: { actorId?: string; opportunityId?: string }): Promise<Invoice[]>;
    findById(id: string): Promise<Invoice | null>;
    updateStatus(id: string, status: string): Promise<void>;
    findNextNumber(tenantId: string): Promise<string>; // e.g. INV-2023-001
}
