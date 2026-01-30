import { Inject, Injectable } from '@nestjs/common';
import { DOCUMENT_REPOSITORY, type DocumentRepositoryPort } from '../../domain/ports/document.repository.port';
import { Document } from '../../domain/entities/document.entity';

@Injectable()
export class GetDocumentsUseCase {
    constructor(
        @Inject(DOCUMENT_REPOSITORY)
        private readonly documentRepository: DocumentRepositoryPort,
    ) { }

    async execute(tenantId: string, filters?: { actorId?: string; opportunityId?: string }): Promise<Document[]> {
        return this.documentRepository.findAll(tenantId, filters);
    }
}
