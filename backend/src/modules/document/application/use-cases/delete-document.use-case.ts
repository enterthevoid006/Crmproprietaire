import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { DOCUMENT_REPOSITORY, type DocumentRepositoryPort } from '../../domain/ports/document.repository.port';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';

@Injectable()
export class DeleteDocumentUseCase {
    constructor(
        @Inject(DOCUMENT_REPOSITORY) private documentRepo: DocumentRepositoryPort,
    ) { }

    async execute(id: string, tenantId: string): Promise<void> {
        const contextTenantId = TenantContext.getTenantIdOrThrow();
        if (contextTenantId !== tenantId) {
            throw new ForbiddenException('Accès refusé.');
        }
        await this.documentRepo.delete(id);
    }
}
