import { Inject, Injectable } from '@nestjs/common';
import { Interaction, InteractionType } from '../../domain/entities/interaction.entity';
import { INTERACTION_REPOSITORY, type InteractionRepositoryPort } from '../../domain/ports/interaction.repository.port';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';
import { IsEnum, IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateInteractionRequest {
    @IsEnum(InteractionType)
    @IsNotEmpty()
    type!: InteractionType;

    @IsString()
    @IsNotEmpty()
    summary!: string;

    @IsString()
    @IsOptional()
    details?: string;

    @IsDateString()
    @IsOptional()
    date?: Date;

    @IsString()
    @IsOptional()
    actorId?: string;

    @IsString()
    @IsOptional()
    opportunityId?: string;
}

@Injectable()
export class CreateInteractionUseCase {
    constructor(
        @Inject(INTERACTION_REPOSITORY) private interactionRepo: InteractionRepositoryPort,
    ) { }

    async execute(request: CreateInteractionRequest) {
        const tenantId = TenantContext.getTenantIdOrThrow();

        const interaction = Interaction.create({
            tenantId,
            type: request.type,
            summary: request.summary,
            details: request.details || null,
            date: request.date ? new Date(request.date) : new Date(),
            actorId: request.actorId || null,
            opportunityId: request.opportunityId || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await this.interactionRepo.save(interaction);

        // Return serializable object
        return {
            id: interaction.id,
            ...interaction.getProps(),
        };
    }
}
