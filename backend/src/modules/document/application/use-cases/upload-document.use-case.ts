import { Inject, Injectable } from '@nestjs/common';
import { DOCUMENT_REPOSITORY, type DocumentRepositoryPort } from '../../domain/ports/document.repository.port';
import { Document } from '../../domain/entities/document.entity';
import { v7 as uuidv7 } from 'uuid';

interface UploadDocumentCommand {
    tenantId: string;
    file: Express.Multer.File; // Using Express Multer type
    actorId?: string;
    opportunityId?: string;
}

@Injectable()
export class UploadDocumentUseCase {
    constructor(
        @Inject(DOCUMENT_REPOSITORY)
        private readonly documentRepository: DocumentRepositoryPort,
    ) { }

    async execute(command: UploadDocumentCommand): Promise<Document> {
        // NOTE: In a real production app, we would move the file from temp storage to permanent storage (S3/Local) here.
        // For this MVP, we assume the Controller used a DiskStorage engine that already placed the file in 'uploads/' 
        // and we just record the metadata.

        const doc = new Document(
            uuidv7(),
            command.tenantId,
            command.file.originalname,
            command.file.path, // Path where it was saved
            command.file.mimetype,
            command.file.size,
            new Date(),
            new Date(),
            command.actorId,
            command.opportunityId,
        );

        return this.documentRepository.save(doc);
    }
}
