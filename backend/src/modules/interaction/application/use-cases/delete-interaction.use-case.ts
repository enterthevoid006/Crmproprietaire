import { Inject, Injectable } from '@nestjs/common';
import { INTERACTION_REPOSITORY, type InteractionRepositoryPort } from '../../domain/ports/interaction.repository.port';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';

@Injectable()
export class DeleteInteractionUseCase {
    constructor(
        @Inject(INTERACTION_REPOSITORY) private interactionRepo: InteractionRepositoryPort,
    ) { }

    async execute(id: string): Promise<void> {
        const tenantId = TenantContext.getTenantIdOrThrow();
        await this.interactionRepo.delete(id);
    }
}
