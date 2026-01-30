import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { UploadDocumentUseCase } from './application/use-cases/upload-document.use-case';
import { GetDocumentsUseCase } from './application/use-cases/get-documents.use-case';
import { DeleteDocumentUseCase } from './application/use-cases/delete-document.use-case';
import { PrismaDocumentRepository } from './infrastructure/persistence/prisma-document.repository';
import { DOCUMENT_REPOSITORY } from './domain/ports/document.repository.port';
import { PrismaModule } from '../../shared/infrastructure/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [DocumentController],
    providers: [
        UploadDocumentUseCase,
        UploadDocumentUseCase,
        GetDocumentsUseCase,
        DeleteDocumentUseCase,
        {
            provide: DOCUMENT_REPOSITORY,
            useClass: PrismaDocumentRepository,
        },
    ],
})
export class DocumentModule { }
