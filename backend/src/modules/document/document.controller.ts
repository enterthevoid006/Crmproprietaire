import {
    Controller,
    Get,
    Post,
    Delete,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Query,
    Body,
    Req,
    Param,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../iam/infrastructure/authentication/jwt-auth.guard';
import { UploadDocumentUseCase } from './application/use-cases/upload-document.use-case';
import { GetDocumentsUseCase } from './application/use-cases/get-documents.use-case';
import { DeleteDocumentUseCase } from './application/use-cases/delete-document.use-case';
import { diskStorage } from 'multer';
import { extname, basename } from 'path';

const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx']);

// Sanitise filename: strip path separators and keep only safe characters
const sanitizeFilename = (raw: string): string => {
    const base = basename(raw).replace(/[^a-zA-Z0-9._-]/g, '_');
    return base.slice(0, 100); // cap length
};

const editFileName = (req, file, callback) => {
    const ext = extname(file.originalname).toLowerCase();
    const safeName = sanitizeFilename(file.originalname.slice(0, file.originalname.length - ext.length));
    const randomName = Array(8).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
    callback(null, `${safeName}-${randomName}${ext}`);
};

const fileFilter = (req, file, callback) => {
    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
        return callback(new BadRequestException(
            'Type de fichier non autorisé. Formats acceptés : PDF, JPG, PNG, DOC, DOCX, XLS, XLSX.'
        ), false);
    }
    callback(null, true);
};

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
    constructor(
        private readonly uploadDocumentUseCase: UploadDocumentUseCase,
        private readonly getDocumentsUseCase: GetDocumentsUseCase,
        private readonly deleteDocumentUseCase: DeleteDocumentUseCase,
    ) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: editFileName,
        }),
        fileFilter,
        limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    }))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: { actorId?: string; opportunityId?: string },
        @Req() req: any,
    ) {
        const tenantId = req.user.tenantId;
        return this.uploadDocumentUseCase.execute({
            tenantId,
            file,
            actorId: body.actorId,
            opportunityId: body.opportunityId,
        });
    }

    @Get()
    async getDocuments(
        @Query('actorId') actorId: string,
        @Query('opportunityId') opportunityId: string,
        @Req() req: any,
    ) {
        const tenantId = req.user.tenantId;
        return this.getDocumentsUseCase.execute(tenantId, { actorId, opportunityId });
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: any) {
        return this.deleteDocumentUseCase.execute(id, req.user.tenantId);
    }
}
