import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from '../../domain/entities/invoice.entity';
import { INVOICE_REPOSITORY } from '../../domain/ports/invoice.repository.port';
import type { InvoiceRepositoryPort } from '../../domain/ports/invoice.repository.port';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class UpdateInvoiceStatusUseCase {
    constructor(
        @Inject(INVOICE_REPOSITORY) private invoiceRepo: InvoiceRepositoryPort,
        private auditService: AuditService,
    ) { }

    async execute(invoiceId: string, newStatus: InvoiceStatus, user: any): Promise<void> {
        const invoice = await this.invoiceRepo.findById(invoiceId);

        if (!invoice) {
            throw new NotFoundException(`Invoice ${invoiceId} not found`);
        }

        if (!invoice.canTransitionTo(newStatus)) {
            throw new BadRequestException(`Invalid state transition: Cannot move Invoice from ${invoice.status} to ${newStatus}`);
        }

        // Create new instance with updated status (Immutability pattern or method update)
        // Here we just update the repository directly or mutable update if entity supports it.
        // For Domain Entity pattern, we should return a new entity. 
        // But our Entity class currently uses public readonly props in constructor.
        // We'll create a clone with new status.

        // TODO: ideally add a method `invoice.updateStatus(newStatus)` returning new Invoice

        // Quick update via repo (simulating persistence update)
        await this.invoiceRepo.updateStatus(invoiceId, newStatus);

        // Audit Log
        await this.auditService.log({
            tenantId: user.tenantId,
            userId: user.userId,
            userEmail: user.email, // Assuming user object has email
            entity: 'Invoice',
            entityId: invoiceId,
            action: 'TRANSITION',
            oldValue: { status: invoice.status },
            newValue: { status: newStatus },
            ipAddress: 'N/A', // Could pass from controller if needed
            userAgent: 'N/A'
        });
    }
}
