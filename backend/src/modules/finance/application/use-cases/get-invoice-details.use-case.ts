import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Invoice } from '../../domain/entities/invoice.entity';
import { INVOICE_REPOSITORY } from '../../domain/ports/invoice.repository.port';
import type { InvoiceRepositoryPort } from '../../domain/ports/invoice.repository.port';

@Injectable()
export class GetInvoiceDetailsUseCase {
    constructor(
        @Inject(INVOICE_REPOSITORY) private invoiceRepo: InvoiceRepositoryPort,
    ) { }

    async execute(invoiceId: string, tenantId: string): Promise<Invoice> {
        const invoice = await this.invoiceRepo.findById(invoiceId);

        if (!invoice || invoice.tenantId !== tenantId) {
            throw new NotFoundException(`Invoice ${invoiceId} not found`);
        }

        return invoice;
    }
}
