import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Quote } from '../../domain/entities/quote.entity';

@Injectable()
export class PdfService {
    async generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            this.generateHeader(doc, invoice);
            this.generateCustomerInformation(doc, invoice);
            this.generateInvoiceTable(doc, invoice);
            this.generateFooter(doc);

            doc.end();
        });
    }

    async generateQuotePdf(quote: Quote): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            this.generateQuoteHeader(doc, quote);
            this.generateQuoteCustomerInformation(doc, quote);
            this.generateQuoteTable(doc, quote);
            this.generateFooter(doc);

            doc.end();
        });
    }

    private generateHeader(doc: PDFKit.PDFDocument, invoice: Invoice) {
        doc
            .fillColor('#444444')
            .fontSize(20)
            .text('INVOICE', 50, 57)
            .fontSize(10)
            .text(invoice.number, 200, 65, { align: 'right' })
            .text(invoice.date.toISOString().split('T')[0], 200, 80, { align: 'right' })
            .moveDown();
    }

    private generateCustomerInformation(doc: PDFKit.PDFDocument, invoice: Invoice) {
        doc
            .fillColor('#444444')
            .fontSize(20)
            .text('Facture', 50, 160);

        this.generateHr(doc, 185);

        const customerInformationTop = 200;

        doc
            .fontSize(10)
            .text('Invoice Number:', 50, customerInformationTop)
            .font('Helvetica-Bold')
            .text(invoice.number, 150, customerInformationTop)
            .font('Helvetica')
            .text('Invoice Date:', 50, customerInformationTop + 15)
            .text(new Date(invoice.date).toLocaleDateString(), 150, customerInformationTop + 15)
            .text('Balance Due:', 50, customerInformationTop + 30)
            .text(
                new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoice.total),
                150,
                customerInformationTop + 30
            )

            .font('Helvetica-Bold')
            .text(invoice.actorName || 'Client', 300, customerInformationTop)
            .font('Helvetica')
            .moveDown();

        this.generateHr(doc, 252);
    }

    private generateInvoiceTable(doc: PDFKit.PDFDocument, invoice: Invoice) {
        let i;
        const invoiceTableTop = 330;

        doc.font('Helvetica-Bold');
        this.generateTableRow(
            doc,
            invoiceTableTop,
            'Item',
            'Description',
            'Unit Cost',
            'Quantity',
            'Line Total'
        );
        this.generateHr(doc, invoiceTableTop + 20);
        doc.font('Helvetica');

        let position = 0;
        for (i = 0; i < invoice.items.length; i++) {
            const item = invoice.items[i];
            position = invoiceTableTop + (i + 1) * 30;
            this.generateTableRow(
                doc,
                position,
                (i + 1).toString(),
                item.description,
                this.formatCurrency(item.unitPrice),
                item.quantity.toString(),
                this.formatCurrency(item.unitPrice * item.quantity)
            );

            this.generateHr(doc, position + 20);
        }

        const subtotalPosition = invoiceTableTop + (i + 1) * 30;
        this.generateTableRow(
            doc,
            subtotalPosition,
            '',
            '',
            'Subtotal',
            '',
            this.formatCurrency(invoice.subtotal)
        );

        const paidToDatePosition = subtotalPosition + 20;
        this.generateTableRow(
            doc,
            paidToDatePosition,
            '',
            '',
            'Tax (20%)',
            '',
            this.formatCurrency(invoice.taxAmount)
        );

        const duePosition = paidToDatePosition + 25;
        doc.font('Helvetica-Bold');
        this.generateTableRow(
            doc,
            duePosition,
            '',
            '',
            'Balance Due',
            '',
            this.formatCurrency(invoice.total)
        );
        doc.font('Helvetica');
    }

    private generateQuoteHeader(doc: PDFKit.PDFDocument, quote: Quote) {
        doc
            .fillColor('#444444')
            .fontSize(20)
            .text('DEVIS', 50, 57)
            .fontSize(10)
            .text(quote.number, 200, 65, { align: 'right' })
            .text(quote.date.toISOString().split('T')[0], 200, 80, { align: 'right' })
            .moveDown();
    }

    private generateQuoteCustomerInformation(doc: PDFKit.PDFDocument, quote: Quote) {
        doc
            .fillColor('#444444')
            .fontSize(20)
            .text('Devis', 50, 160);

        this.generateHr(doc, 185);

        const customerInformationTop = 200;

        doc
            .fontSize(10)
            .text('Quote Number:', 50, customerInformationTop)
            .font('Helvetica-Bold')
            .text(quote.number, 150, customerInformationTop)
            .font('Helvetica')
            .text('Date:', 50, customerInformationTop + 15)
            .text(new Date(quote.date).toLocaleDateString(), 150, customerInformationTop + 15)
            .text('Valid Until:', 50, customerInformationTop + 30)
            .text(new Date(quote.validUntil).toLocaleDateString(), 150, customerInformationTop + 30)
            .text('Total:', 50, customerInformationTop + 45)
            .text(
                this.formatCurrency(quote.total),
                150,
                customerInformationTop + 45
            )

            .font('Helvetica-Bold')
            .text(quote.actorName || 'Client', 300, customerInformationTop)
            .font('Helvetica')
            .moveDown();

        this.generateHr(doc, 252);
    }

    private generateQuoteTable(doc: PDFKit.PDFDocument, quote: Quote) {
        let i;
        const invoiceTableTop = 330;

        doc.font('Helvetica-Bold');
        this.generateTableRow(
            doc,
            invoiceTableTop,
            'Item',
            'Description',
            'Unit Cost',
            'Quantity',
            'Line Total'
        );
        this.generateHr(doc, invoiceTableTop + 20);
        doc.font('Helvetica');

        let position = 0;
        for (i = 0; i < quote.items.length; i++) {
            const item = quote.items[i];
            position = invoiceTableTop + (i + 1) * 30;
            this.generateTableRow(
                doc,
                position,
                (i + 1).toString(),
                item.description,
                this.formatCurrency(item.unitPrice),
                item.quantity.toString(),
                this.formatCurrency(item.unitPrice * item.quantity)
            );

            this.generateHr(doc, position + 20);
        }

        const subtotalPosition = invoiceTableTop + (i + 1) * 30;
        this.generateTableRow(
            doc,
            subtotalPosition,
            '',
            '',
            'Subtotal',
            '',
            this.formatCurrency(quote.subtotal)
        );

        const paidToDatePosition = subtotalPosition + 20;
        this.generateTableRow(
            doc,
            paidToDatePosition,
            '',
            '',
            'Tax (20%)',
            '',
            this.formatCurrency(quote.taxAmount)
        );

        const duePosition = paidToDatePosition + 25;
        doc.font('Helvetica-Bold');
        this.generateTableRow(
            doc,
            duePosition,
            '',
            '',
            'Total',
            '',
            this.formatCurrency(quote.total)
        );
        doc.font('Helvetica');
    }

    private generateFooter(doc: PDFKit.PDFDocument) {
        doc
            .fontSize(10)
            .text(
                'Payment is due within 15 days. Thank you for your business.',
                50,
                700,
                { align: 'center', width: 500 }
            );
    }

    private generateTableRow(
        doc: PDFKit.PDFDocument,
        y: number,
        item: string,
        description: string,
        unitCost: string,
        quantity: string,
        lineTotal: string
    ) {
        doc
            .fontSize(10)
            .text(item, 50, y)
            .text(description, 150, y)
            .text(unitCost, 280, y, { width: 90, align: 'right' })
            .text(quantity, 370, y, { width: 90, align: 'right' })
            .text(lineTotal, 0, y, { align: 'right' });
    }

    private generateHr(doc: PDFKit.PDFDocument, y: number) {
        doc
            .strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(50, y)
            .lineTo(550, y)
            .stroke();
    }

    private formatCurrency(cents: number) {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents);
    }
}
