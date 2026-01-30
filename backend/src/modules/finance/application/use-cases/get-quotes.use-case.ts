import { Injectable, Inject } from '@nestjs/common';
import { QUOTE_REPOSITORY, type QuoteRepositoryPort } from '../../domain/ports/quote.repository.port';
import { Quote } from '../../domain/entities/quote.entity';

@Injectable()
export class GetQuotesUseCase {
    constructor(
        @Inject(QUOTE_REPOSITORY) private readonly quoteRepo: QuoteRepositoryPort
    ) { }

    async execute(tenantId: string, filters?: { actorId?: string; opportunityId?: string }): Promise<Quote[]> {
        return this.quoteRepo.findAll(tenantId, filters);
    }
}
