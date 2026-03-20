import { Interaction } from '../entities/interaction.entity';

export const INTERACTION_REPOSITORY = 'INTERACTION_REPOSITORY';

export interface InteractionRepositoryPort {
    save(interaction: Interaction): Promise<void>;
    findById(id: string): Promise<Interaction | null>;
    findByActorId(actorId: string): Promise<Interaction[]>;
    findByOpportunityId(opportunityId: string): Promise<Interaction[]>;
    findAll(limit?: number, offset?: number): Promise<Interaction[]>;
    delete(id: string): Promise<void>;
}
