import { Actor } from '../entities/actor.entity';

export interface UpdateActorFields {
    firstName?: string | null;
    lastName?: string | null;
    companyName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    source?: string | null;
    tags?: string[];
}

export interface ActorRepositoryPort {
    save(actor: Actor): Promise<void>;
    findById(id: string): Promise<Actor | null>;
    findAll(limit?: number, offset?: number): Promise<Actor[]>;
    update(id: string, fields: UpdateActorFields): Promise<Actor | null>;
}

export const ACTOR_REPOSITORY = Symbol('ACTOR_REPOSITORY');
