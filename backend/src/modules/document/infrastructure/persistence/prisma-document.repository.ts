import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { DocumentRepositoryPort } from '../../domain/ports/document.repository.port';
import { Document } from '../../domain/entities/document.entity';
import { DocumentMapper } from './document.mapper';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';

@Injectable()
export class PrismaDocumentRepository implements DocumentRepositoryPort {
    constructor(private readonly prisma: PrismaService) { }

    async save(document: Document): Promise<Document> {
        const persistenceModel = DocumentMapper.toPersistence(document);
        const saved = await this.prisma.document.create({
            data: persistenceModel,
        });
        return DocumentMapper.toDomain(saved);
    }

    async findAll(tenantId: string, filters?: { actorId?: string; opportunityId?: string }): Promise<Document[]> {
        const whereClause: any = { tenantId };

        if (filters?.actorId) {
            whereClause.actorId = filters.actorId;
        }
        if (filters?.opportunityId) {
            whereClause.opportunityId = filters.opportunityId;
        }

        const documents = await this.prisma.document.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
        });

        return documents.map(DocumentMapper.toDomain);
    }

    async findById(id: string): Promise<Document | null> {
        const tenantId = TenantContext.getTenantIdOrThrow();
        const document = await this.prisma.document.findFirst({
            where: { id, tenantId },
        });
        return document ? DocumentMapper.toDomain(document) : null;
    }

    async delete(id: string): Promise<void> {
        const tenantId = TenantContext.getTenantIdOrThrow();
        await this.prisma.document.deleteMany({
            where: { id, tenantId },
        });
    }
}
