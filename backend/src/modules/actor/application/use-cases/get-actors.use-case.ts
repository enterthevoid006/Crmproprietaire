import { Inject, Injectable } from '@nestjs/common';
import { Actor } from '../../domain/entities/actor.entity';
import { ACTOR_REPOSITORY } from '../../domain/ports/actor.repository.port';
import type { ActorRepositoryPort } from '../../domain/ports/actor.repository.port';

@Injectable()
export class GetActorsUseCase {
    constructor(
        @Inject(ACTOR_REPOSITORY) private actorRepo: ActorRepositoryPort,
    ) { }

    async execute(limit: number = 20, offset: number = 0): Promise<Actor[]> {
        return this.actorRepo.findAll(limit, offset);
    }
}
