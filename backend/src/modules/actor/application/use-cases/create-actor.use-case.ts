import { Inject, Injectable } from '@nestjs/common';
import { Actor, ActorType } from '../../domain/entities/actor.entity';
import { ACTOR_REPOSITORY } from '../../domain/ports/actor.repository.port';
import type { ActorRepositoryPort } from '../../domain/ports/actor.repository.port';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';

import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

export class CreateActorRequest {
    @IsEnum(ActorType)
    type!: ActorType;

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

    @IsOptional()
    customFields?: Record<string, any>;
}

@Injectable()
export class CreateActorUseCase {
    constructor(
        @Inject(ACTOR_REPOSITORY) private actorRepo: ActorRepositoryPort,
    ) { }

    async execute(request: CreateActorRequest): Promise<Actor> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        const actor = Actor.create({
            tenantId,
            type: request.type,
            firstName: request.firstName,
            lastName: request.lastName,
            companyName: request.companyName,
            email: request.email,
            phone: request.phone,
            address: request.address,
            source: request.source,
            tags: request.tags,
            customFields: request.customFields,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await this.actorRepo.save(actor);

        return actor;
    }
}
