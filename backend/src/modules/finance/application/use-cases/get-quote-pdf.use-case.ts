import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { QuoteRepositoryPort } from '../../domain/ports/quote.repository.port';
import { QUOTE_REPOSITORY } from '../../domain/ports/quote.repository.port';
import { PdfService } from '../../infrastructure/services/pdf.service';

@Injectable()
export class GetQuotePdfUseCase {
    constructor(
        @Inject(QUOTE_REPOSITORY) private readonly quoteRepo: QuoteRepositoryPort,
        private readonly pdfService: PdfService
    ) { }

    async execute(id: string): Promise<Buffer> {
        const quote = await this.quoteRepo.findById(id);
        if (!quote) throw new NotFoundException('Quote not found');

        return this.pdfService.generateQuotePdf(quote);
    }
}
