import { Module } from '@nestjs/common';
import { InvoiceController } from './finance.controller';
import { CreateInvoiceUseCase } from './application/use-cases/create-invoice.use-case';
import { GetInvoicesUseCase } from './application/use-cases/get-invoices.use-case';
import { GetInvoiceDetailsUseCase } from './application/use-cases/get-invoice-details.use-case';
import { UpdateInvoiceStatusUseCase } from './application/use-cases/update-invoice-status.use-case';
import { INVOICE_REPOSITORY } from './domain/ports/invoice.repository.port';
import { PrismaInvoiceRepository } from './infrastructure/persistence/prisma-invoice.repository';
import { PrismaModule } from '../../shared/infrastructure/prisma/prisma.module';
import { PdfService } from './infrastructure/services/pdf.service';
import { GetInvoicePdfUseCase } from './application/use-cases/get-invoice-pdf.use-case';
import { CreateQuoteUseCase } from './application/use-cases/create-quote.use-case';
import { GetQuotesUseCase } from './application/use-cases/get-quotes.use-case';
import { GetQuoteDetailsUseCase } from './application/use-cases/get-quote-details.use-case';
import { UpdateQuoteStatusUseCase } from './application/use-cases/update-quote-status.use-case';
import { GetQuotePdfUseCase } from './application/use-cases/get-quote-pdf.use-case';
import { QUOTE_REPOSITORY } from './domain/ports/quote.repository.port';
import { PrismaQuoteRepository } from './infrastructure/persistence/prisma-quote.repository';

@Module({
    imports: [PrismaModule],
    controllers: [InvoiceController],
    providers: [
        CreateInvoiceUseCase,
        GetInvoicesUseCase,
        GetInvoiceDetailsUseCase,
        UpdateInvoiceStatusUseCase,
        GetInvoicePdfUseCase,
        CreateQuoteUseCase,
        GetQuotesUseCase,
        GetQuoteDetailsUseCase,
        UpdateQuoteStatusUseCase,
        GetQuotePdfUseCase,
        PdfService,
        {
            provide: INVOICE_REPOSITORY,
            useClass: PrismaInvoiceRepository,
        },
        {
            provide: QUOTE_REPOSITORY,
            useClass: PrismaQuoteRepository,
        },
    ],
})
export class FinanceModule { }
