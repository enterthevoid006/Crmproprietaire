import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { QUOTE_REPOSITORY, type QuoteRepositoryPort } from '../../domain/ports/quote.repository.port';
import { Quote } from '../../domain/entities/quote.entity';

@Injectable()
export class GetQuoteDetailsUseCase {
    constructor(
        @Inject(QUOTE_REPOSITORY) private readonly quoteRepo: QuoteRepositoryPort
    ) { }

    async execute(id: string): Promise<Quote> {
        const quote = await this.quoteRepo.findById(id);
        if (!quote) throw new NotFoundException('Quote not found');
        return quote;
    }
}
