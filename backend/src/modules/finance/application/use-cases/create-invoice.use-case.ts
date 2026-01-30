import { Inject, Injectable } from '@nestjs/common';
import { INVOICE_REPOSITORY, type InvoiceRepositoryPort } from '../../domain/ports/invoice.repository.port';
import { Invoice, InvoiceStatus, InvoiceItem } from '../../domain/entities/invoice.entity';
import { v7 as uuidv7 } from 'uuid';

export interface CreateInvoiceCommand {
    tenantId: string;
    actorId: string;
    opportunityId?: string;
    items: InvoiceItem[];
    dueDate: Date;
}

@Injectable()
export class CreateInvoiceUseCase {
    constructor(
        @Inject(INVOICE_REPOSITORY)
        private readonly invoiceRepository: InvoiceRepositoryPort,
    ) { }

    async execute(command: CreateInvoiceCommand): Promise<Invoice> {
        // 1. Generate Invoice Number
        const number = await this.invoiceRepository.findNextNumber(command.tenantId);

        // 2. Calculate Totals
        const { subtotal, taxAmount, total } = Invoice.calculateTotals(command.items);

        // 3. Create Entity
        const invoice = new Invoice(
            uuidv7(),
            command.tenantId,
            command.actorId,
            number,
            new Date(), // Issue Date = Now
            command.dueDate,
            InvoiceStatus.DRAFT,
            command.items,
            subtotal,
            taxAmount,
            total,
            new Date(),
            new Date(),
            command.opportunityId,
        );

        // 4. Save
        return this.invoiceRepository.save(invoice);
    }
}
