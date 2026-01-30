import { Actor } from '../entities/actor.entity';

export interface ActorRepositoryPort {
    save(actor: Actor): Promise<void>;
    findById(id: string): Promise<Actor | null>;
    findAll(limit?: number, offset?: number): Promise<Actor[]>;
}

export const ACTOR_REPOSITORY = Symbol('ACTOR_REPOSITORY');
