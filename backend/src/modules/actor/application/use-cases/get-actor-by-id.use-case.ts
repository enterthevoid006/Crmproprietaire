import { Inject, Injectable } from '@nestjs/common';
import { Actor } from '../../domain/entities/actor.entity';
import { ACTOR_REPOSITORY, type ActorRepositoryPort } from '../../domain/ports/actor.repository.port';

@Injectable()
export class GetActorByIdUseCase {
    constructor(
        @Inject(ACTOR_REPOSITORY) private actorRepo: ActorRepositoryPort,
    ) { }

    async execute(id: string): Promise<Actor | null> {
        return this.actorRepo.findById(id);
    }
}
