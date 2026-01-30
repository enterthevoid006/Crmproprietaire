import { Quote as PrismaQuote, QuoteStatus as PrismaQuoteStatus } from '@prisma/client';
import { Quote, QuoteItem, QuoteStatus } from '../../domain/entities/quote.entity';

export class QuoteMapper {
    static toDomain(prismaQuote: PrismaQuote): Quote {
        return new Quote(
            prismaQuote.id,
            prismaQuote.tenantId,
            prismaQuote.actorId,
            prismaQuote.number,
            prismaQuote.date,
            prismaQuote.validUntil,
            prismaQuote.status as QuoteStatus,
            prismaQuote.items as unknown as QuoteItem[],
            prismaQuote.subtotal,
            prismaQuote.taxAmount,
            prismaQuote.total,
            prismaQuote.createdAt,
            prismaQuote.updatedAt,
            prismaQuote.opportunityId || undefined,
            (prismaQuote as any).actor?.name
        );
    }

    static toPersistence(domain: Quote): PrismaQuote {
        return {
            id: domain.id,
            tenantId: domain.tenantId,
            actorId: domain.actorId,
            opportunityId: domain.opportunityId || null,
            number: domain.number,
            date: domain.date,
            validUntil: domain.validUntil,
            status: domain.status as PrismaQuoteStatus,
            subtotal: domain.subtotal,
            taxAmount: domain.taxAmount,
            total: domain.total,
            items: domain.items as any,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
        } as any;
    }
}
