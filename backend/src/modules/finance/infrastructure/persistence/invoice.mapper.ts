import { Invoice as PrismaInvoice, InvoiceStatus as PrismaInvoiceStatus } from '@prisma/client';
import { Invoice, InvoiceItem, InvoiceStatus } from '../../domain/entities/invoice.entity';

export class InvoiceMapper {
    static toDomain(prismaInvoice: PrismaInvoice): Invoice {
        return new Invoice(
            prismaInvoice.id,
            prismaInvoice.tenantId,
            prismaInvoice.actorId,
            prismaInvoice.number,
            prismaInvoice.date,
            prismaInvoice.dueDate,
            prismaInvoice.status as InvoiceStatus,
            prismaInvoice.items as unknown as InvoiceItem[],
            prismaInvoice.subtotal,
            prismaInvoice.taxAmount,
            prismaInvoice.total,
            prismaInvoice.createdAt,
            prismaInvoice.updatedAt,
            prismaInvoice.opportunityId || undefined,
            undefined,
            (prismaInvoice as any).actor?.name
        );
    }

    static toPersistence(domain: Invoice): PrismaInvoice {
        return {
            id: domain.id,
            tenantId: domain.tenantId,
            actorId: domain.actorId,
            opportunityId: domain.opportunityId || null,
            number: domain.number,
            date: domain.date,
            dueDate: domain.dueDate,
            status: domain.status as PrismaInvoiceStatus,
            subtotal: domain.subtotal,
            taxAmount: domain.taxAmount,
            total: domain.total,
            items: domain.items as any,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
        } as any;
    }
}
