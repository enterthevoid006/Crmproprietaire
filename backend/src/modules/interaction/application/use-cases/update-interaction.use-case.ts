import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InteractionType } from '../../domain/entities/interaction.entity';
import { INTERACTION_REPOSITORY, type InteractionRepositoryPort } from '../../domain/ports/interaction.repository.port';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';
import { IsEnum, IsString, IsOptional } from 'class-validator';

export class UpdateInteractionRequest {
    @IsEnum(InteractionType)
    @IsOptional()
    type?: InteractionType;

    @IsString()
    @IsOptional()
    summary?: string;
}

@Injectable()
export class UpdateInteractionUseCase {
    constructor(
        @Inject(INTERACTION_REPOSITORY) private interactionRepo: InteractionRepositoryPort,
    ) {}

    async execute(id: string, request: UpdateInteractionRequest) {
        const tenantId = TenantContext.getTenantIdOrThrow();
        const interaction = await this.interactionRepo.findById(id);

        if (!interaction || interaction.getProps().tenantId !== tenantId) {
            throw new NotFoundException('Interaction not found');
        }

        if (request.type !== undefined)    (interaction as any).props.type    = request.type;
        if (request.summary !== undefined) (interaction as any).props.summary = request.summary;
        (interaction as any).props.updatedAt = new Date();

        await this.interactionRepo.save(interaction);
        return { id: interaction.id, ...interaction.getProps() };
    }
}
