import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
    Req,
    Res,
    BadRequestException,
    Inject
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../iam/infrastructure/authentication/jwt-auth.guard';
import { CreateInvoiceUseCase, CreateInvoiceCommand } from './application/use-cases/create-invoice.use-case';
import { GetInvoicesUseCase } from './application/use-cases/get-invoices.use-case';
import { GetInvoiceDetailsUseCase } from './application/use-cases/get-invoice-details.use-case';
import { UpdateInvoiceStatusUseCase } from './application/use-cases/update-invoice-status.use-case';
import { GetInvoicePdfUseCase } from './application/use-cases/get-invoice-pdf.use-case';
import { InvoiceStatus } from './domain/entities/invoice.entity';
import { INVOICE_REPOSITORY } from './domain/ports/invoice.repository.port';
import { CreateQuoteUseCase, CreateQuoteCommand } from './application/use-cases/create-quote.use-case';
import { GetQuotesUseCase } from './application/use-cases/get-quotes.use-case';
import { GetQuoteDetailsUseCase } from './application/use-cases/get-quote-details.use-case';
import { UpdateQuoteStatusUseCase } from './application/use-cases/update-quote-status.use-case';
import { GetQuotePdfUseCase } from './application/use-cases/get-quote-pdf.use-case';
import { QuoteStatus } from './domain/entities/quote.entity';
import { Patch, Param } from '@nestjs/common';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
    constructor(
        private readonly createInvoiceUseCase: CreateInvoiceUseCase,
        private readonly getInvoicesUseCase: GetInvoicesUseCase,
        private readonly getInvoiceDetailsUseCase: GetInvoiceDetailsUseCase,
        private readonly updateInvoiceStatusUseCase: UpdateInvoiceStatusUseCase,

        private readonly getInvoicePdfUseCase: GetInvoicePdfUseCase,
        private readonly createQuoteUseCase: CreateQuoteUseCase,
        private readonly getQuotesUseCase: GetQuotesUseCase,
        private readonly getQuoteDetailsUseCase: GetQuoteDetailsUseCase,
        private readonly updateQuoteStatusUseCase: UpdateQuoteStatusUseCase,
        private readonly getQuotePdfUseCase: GetQuotePdfUseCase,
    ) { }

    @Post()
    async create(@Body() body: any, @Req() req: any) {
        // Simple validation for MVP
        if (!body.actorId || !body.items || !Array.isArray(body.items)) {
            throw new BadRequestException('Invalid invoice data');
        }

        const command: CreateInvoiceCommand = {
            tenantId: req.user.tenantId,
            actorId: body.actorId,
            opportunityId: body.opportunityId,
            items: body.items,
            dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
        };

        return this.createInvoiceUseCase.execute(command);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: any) {
        return this.getInvoiceDetailsUseCase.execute(id, req.user.tenantId);
    }

    @Get()
    async findAll(
        @Query('actorId') actorId: string,
        @Query('opportunityId') opportunityId: string,
        @Req() req: any
    ) {
        const tenantId = req.user.tenantId;
        return this.getInvoicesUseCase.execute(tenantId, { actorId, opportunityId });
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: InvoiceStatus,
        @Req() req: any
    ) {
        // TODO: Validate user has rights to update this invoice (Security Phase related to ownership)
        // For now, RBAC keeps non-Admins out if we strictly enforced it.
        // We added @Roles decorators earlier, here we rely on basic Auth.
        // But the UseCase will fetch the invoice. We should ideally check tenantId there too.

        return this.updateInvoiceStatusUseCase.execute(id, status, req.user);
    }

    @Get(':id/pdf')
    async downloadPdf(@Param('id') id: string, @Res() res: Response) {
        const buffer = await this.getInvoicePdfUseCase.execute(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    // --- QUOTES ENDPOINTS ---

    @Post('/quotes')
    async createQuote(@Body() body: any, @Req() req: any) {
        if (!body.actorId || !body.items || !Array.isArray(body.items)) {
            throw new BadRequestException('Invalid quote data');
        }

        const command: CreateQuoteCommand = {
            tenantId: req.user.tenantId,
            actorId: body.actorId,
            opportunityId: body.opportunityId,
            items: body.items,
            validUntil: body.validUntil,
        };

        return this.createQuoteUseCase.execute(command);
    }

    @Get('/quotes/all')
    async findAllQuotes(
        @Query('actorId') actorId: string,
        @Query('opportunityId') opportunityId: string,
        @Req() req: any
    ) {
        return this.getQuotesUseCase.execute(req.user.tenantId, { actorId, opportunityId });
    }

    @Get('/quotes/:id')
    async findOneQuote(@Param('id') id: string) {
        return this.getQuoteDetailsUseCase.execute(id);
    }

    @Patch('/quotes/:id/status')
    async updateQuoteStatus(
        @Param('id') id: string,
        @Body('status') status: QuoteStatus,
        @Req() req: any
    ) {
        // TODO: security check tenant
        return this.updateQuoteStatusUseCase.execute(id, status);
    }

    @Get('/quotes/:id/pdf')
    async downloadQuotePdf(@Param('id') id: string, @Res() res: Response) {
        const buffer = await this.getQuotePdfUseCase.execute(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=quote-${id}.pdf`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }
}
