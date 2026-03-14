import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IsString, IsOptional, IsArray } from 'class-validator';
import { Actor } from '../../domain/entities/actor.entity';
import { ACTOR_REPOSITORY } from '../../domain/ports/actor.repository.port';
import type { ActorRepositoryPort } from '../../domain/ports/actor.repository.port';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';

export class UpdateActorRequest {
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsString()
    @IsOptional()
    companyName?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    source?: string;

    @IsArray()
    @IsOptional()
    tags?: string[];
}

@Injectable()
export class UpdateActorUseCase {
    constructor(
        @Inject(ACTOR_REPOSITORY) private actorRepo: ActorRepositoryPort,
    ) { }

    async execute(id: string, request: UpdateActorRequest): Promise<Actor> {
        // Ensures request is authenticated — tenantId never comes from the body
        TenantContext.getTenantIdOrThrow();

        const updated = await this.actorRepo.update(id, {
            firstName: request.firstName,
            lastName: request.lastName,
            companyName: request.companyName,
            email: request.email,
            phone: request.phone,
            address: request.address,
            source: request.source,
            tags: request.tags,
        });

        if (!updated) {
            throw new NotFoundException(`Actor with ID ${id} not found or access denied`);
        }

        return updated;
    }
}
