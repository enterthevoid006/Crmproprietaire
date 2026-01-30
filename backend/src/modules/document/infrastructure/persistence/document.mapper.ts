import { Document as PrismaDocument } from '@prisma/client';
import { Document } from '../../domain/entities/document.entity';

export class DocumentMapper {
    static toDomain(prismaDoc: PrismaDocument): Document {
        return new Document(
            prismaDoc.id,
            prismaDoc.tenantId,
            prismaDoc.filename,
            prismaDoc.path,
            prismaDoc.mimeType,
            prismaDoc.size,
            prismaDoc.createdAt,
            prismaDoc.updatedAt,
            prismaDoc.actorId || undefined,
            prismaDoc.opportunityId || undefined,
        );
    }

    static toPersistence(domain: Document): PrismaDocument {
        return {
            id: domain.id,
            tenantId: domain.tenantId,
            filename: domain.filename,
            path: domain.path,
            mimeType: domain.mimeType,
            size: domain.size,
            actorId: domain.actorId || null,
            opportunityId: domain.opportunityId || null,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
        };
    }
}
