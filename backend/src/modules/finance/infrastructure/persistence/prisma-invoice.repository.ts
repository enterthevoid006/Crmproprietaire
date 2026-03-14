import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { InvoiceRepositoryPort } from '../../domain/ports/invoice.repository.port';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceMapper } from './invoice.mapper';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';

@Injectable()
export class PrismaInvoiceRepository implements InvoiceRepositoryPort {
    constructor(private readonly prisma: PrismaService) { }

    async save(invoice: Invoice): Promise<Invoice> {
        const persistenceModel = InvoiceMapper.toPersistence(invoice);
        const { id, tenantId, createdAt, ...updateData } = persistenceModel as any;
        const saved = await this.prisma.invoice.upsert({
            where: { id: invoice.id },
            update: updateData,
            create: persistenceModel as any,
        });
        return InvoiceMapper.toDomain(saved);
    }

    async findAll(tenantId: string, filters?: { actorId?: string; opportunityId?: string }): Promise<Invoice[]> {
        const whereClause: any = { tenantId };

        if (filters?.actorId) whereClause.actorId = filters.actorId;
        if (filters?.opportunityId) whereClause.opportunityId = filters.opportunityId;

        const invoices = await this.prisma.invoice.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
            include: { actor: true },
        });

        return invoices.map(InvoiceMapper.toDomain);
    }

    async findById(id: string): Promise<Invoice | null> {
        const tenantId = TenantContext.getTenantIdOrThrow();
        const invoice = await this.prisma.invoice.findFirst({
            where: { id, tenantId },
            include: { actor: true },
        });
        return invoice ? InvoiceMapper.toDomain(invoice) : null;
    }

    async updateStatus(id: string, status: string): Promise<void> {
        const tenantId = TenantContext.getTenantIdOrThrow();
        await this.prisma.invoice.updateMany({
            where: { id, tenantId },
            data: { status: status as any }, // Cast to Prisma Enum
        });
    }

    async findNextNumber(tenantId: string): Promise<string> {
        // Simple auto-increment logic for MVP: count + 1
        // In real app, this should be transactional and configurable pattern
        const count = await this.prisma.invoice.count({ where: { tenantId } });
        const year = new Date().getFullYear();
        const sequence = (count + 1).toString().padStart(4, '0');
        return `INV-${year}-${sequence}`;
    }
}
