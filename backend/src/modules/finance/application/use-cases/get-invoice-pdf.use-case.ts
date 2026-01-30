import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { InvoiceRepositoryPort } from '../../domain/ports/invoice.repository.port';
import { INVOICE_REPOSITORY } from '../../domain/ports/invoice.repository.port';
import { PdfService } from '../../infrastructure/services/pdf.service';

@Injectable()
export class GetInvoicePdfUseCase {
    constructor(
        @Inject(INVOICE_REPOSITORY) private readonly invoiceRepo: InvoiceRepositoryPort,
        private readonly pdfService: PdfService
    ) { }

    async execute(invoiceId: string): Promise<Buffer> {
        const invoice = await this.invoiceRepo.findById(invoiceId);
        if (!invoice) {
            throw new NotFoundException(`Invoice ${invoiceId} not found`);
        }

        return this.pdfService.generateInvoicePdf(invoice);
    }
}
