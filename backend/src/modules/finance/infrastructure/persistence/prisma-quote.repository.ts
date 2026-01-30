import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { QuoteRepositoryPort } from '../../domain/ports/quote.repository.port';
import { Quote } from '../../domain/entities/quote.entity';
import { QuoteMapper } from './quote.mapper';

@Injectable()
export class PrismaQuoteRepository implements QuoteRepositoryPort {
    constructor(private readonly prisma: PrismaService) { }

    async save(quote: Quote): Promise<Quote> {
        const persistenceModel = QuoteMapper.toPersistence(quote);
        const saved = await this.prisma.quote.upsert({
            where: { id: quote.id },
            update: persistenceModel as any,
            create: persistenceModel as any,
        });
        return QuoteMapper.toDomain(saved);
    }

    async findAll(tenantId: string, filters?: { actorId?: string; opportunityId?: string }): Promise<Quote[]> {
        const whereClause: any = { tenantId };

        if (filters?.actorId) whereClause.actorId = filters.actorId;
        if (filters?.opportunityId) whereClause.opportunityId = filters.opportunityId;

        const quotes = await this.prisma.quote.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
            include: { actor: true },
        });

        return quotes.map(QuoteMapper.toDomain);
    }

    async findById(id: string): Promise<Quote | null> {
        const quote = await this.prisma.quote.findUnique({
            where: { id },
            include: { actor: true },
        });
        return quote ? QuoteMapper.toDomain(quote) : null;
    }

    async updateStatus(id: string, status: string): Promise<void> {
        await this.prisma.quote.update({
            where: { id },
            data: { status: status as any }, // Cast to Prisma Enum
        });
    }

    async findNextNumber(tenantId: string): Promise<string> {
        const count = await this.prisma.quote.count({ where: { tenantId } });
        const year = new Date().getFullYear();
        const sequence = (count + 1).toString().padStart(4, '0');
        return `QT-${year}-${sequence}`;
    }
}
