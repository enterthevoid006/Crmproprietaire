import { Quote } from '../entities/quote.entity';

export const QUOTE_REPOSITORY = 'QUOTE_REPOSITORY';

export interface QuoteRepositoryPort {
    save(quote: Quote): Promise<Quote>;
    findAll(tenantId: string, filters?: { actorId?: string; opportunityId?: string }): Promise<Quote[]>;
    findById(id: string): Promise<Quote | null>;
    updateStatus(id: string, status: string): Promise<void>;
    findNextNumber(tenantId: string): Promise<string>; // e.g. QT-2023-001
}
