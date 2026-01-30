import { Inject, Injectable } from '@nestjs/common';
import { INVOICE_REPOSITORY, type InvoiceRepositoryPort } from '../../domain/ports/invoice.repository.port';
import { Invoice } from '../../domain/entities/invoice.entity';

@Injectable()
export class GetInvoicesUseCase {
    constructor(
        @Inject(INVOICE_REPOSITORY)
        private readonly invoiceRepository: InvoiceRepositoryPort,
    ) { }

    async execute(tenantId: string, filters?: { actorId?: string; opportunityId?: string }): Promise<Invoice[]> {
        return this.invoiceRepository.findAll(tenantId, filters);
    }
}
