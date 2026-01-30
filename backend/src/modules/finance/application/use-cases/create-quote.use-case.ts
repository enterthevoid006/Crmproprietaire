import { Injectable, Inject } from '@nestjs/common';
import { QUOTE_REPOSITORY, type QuoteRepositoryPort } from '../../domain/ports/quote.repository.port';
import { Quote, QuoteItem, QuoteStatus } from '../../domain/entities/quote.entity';

export class CreateQuoteCommand {
    tenantId: string;
    actorId: string;
    items: QuoteItem[];
    validUntil?: string; // Optional, default 30 days?
    opportunityId?: string;
}

@Injectable()
export class CreateQuoteUseCase {
    constructor(
        @Inject(QUOTE_REPOSITORY) private readonly quoteRepo: QuoteRepositoryPort,
    ) { }

    async execute(command: CreateQuoteCommand): Promise<Quote> {
        const number = await this.quoteRepo.findNextNumber(command.tenantId);

        // Calculate validity (default 30 days if not provided)
        const date = new Date();
        const validUntil = command.validUntil ? new Date(command.validUntil) : new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000);

        const totals = Quote.calculateTotals(command.items);

        const quote = new Quote(
            crypto.randomUUID(),
            command.tenantId,
            command.actorId,
            number,
            date,
            validUntil,
            QuoteStatus.DRAFT,
            command.items,
            totals.subtotal,
            totals.taxAmount,
            totals.total,
            new Date(),
            new Date(),
            command.opportunityId
        );

        return this.quoteRepo.save(quote);
    }
}
