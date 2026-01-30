import { Document } from '../entities/document.entity';

export const DOCUMENT_REPOSITORY = 'DOCUMENT_REPOSITORY';

export interface DocumentRepositoryPort {
    save(document: Document): Promise<Document>;
    findAll(tenantId: string, filters?: { actorId?: string; opportunityId?: string }): Promise<Document[]>;
    findById(id: string): Promise<Document | null>;
    delete(id: string): Promise<void>;
}
