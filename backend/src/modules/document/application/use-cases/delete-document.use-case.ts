import { Inject, Injectable } from '@nestjs/common';
import { DOCUMENT_REPOSITORY, type DocumentRepositoryPort } from '../../domain/ports/document.repository.port';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';

@Injectable()
export class DeleteDocumentUseCase {
    constructor(
        @Inject(DOCUMENT_REPOSITORY) private documentRepo: DocumentRepositoryPort,
    ) { }

    async execute(id: string): Promise<void> {
        TenantContext.getTenantIdOrThrow();
        await this.documentRepo.delete(id);
    }
}
