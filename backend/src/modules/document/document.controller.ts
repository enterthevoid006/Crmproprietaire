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
    Param
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../iam/infrastructure/authentication/jwt-auth.guard';
import { UploadDocumentUseCase } from './application/use-cases/upload-document.use-case';
import { GetDocumentsUseCase } from './application/use-cases/get-documents.use-case';
import { DeleteDocumentUseCase } from './application/use-cases/delete-document.use-case';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Helper for file naming
const editFileName = (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    const randomName = Array(4).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
    callback(null, `${name}-${randomName}${fileExtName}`);
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
    async delete(@Param('id') id: string) {
        return this.deleteDocumentUseCase.execute(id);
    }
}
