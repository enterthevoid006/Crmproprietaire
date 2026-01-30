import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { QUOTE_REPOSITORY, type QuoteRepositoryPort } from '../../domain/ports/quote.repository.port';
import { QuoteStatus } from '../../domain/entities/quote.entity';

@Injectable()
export class UpdateQuoteStatusUseCase {
    constructor(
        @Inject(QUOTE_REPOSITORY) private readonly quoteRepo: QuoteRepositoryPort
    ) { }

    async execute(id: string, newStatus: QuoteStatus): Promise<void> {
        const quote = await this.quoteRepo.findById(id);
        if (!quote) throw new NotFoundException('Quote not found');

        if (!quote.canTransitionTo(newStatus)) {
            throw new BadRequestException(`Cannot transition quote from ${quote.status} to ${newStatus}`);
        }

        await this.quoteRepo.updateStatus(id, newStatus);
    }
}
