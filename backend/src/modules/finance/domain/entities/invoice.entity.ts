export enum InvoiceStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED'
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export class Invoice {
    constructor(
        public readonly id: string,
        public readonly tenantId: string,
        public readonly actorId: string,
        public readonly number: string,
        public readonly date: Date,
        public readonly dueDate: Date,
        public readonly status: InvoiceStatus,
        public readonly items: InvoiceItem[],
        public readonly subtotal: number,
        public readonly taxAmount: number,
        public readonly total: number,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly opportunityId?: string,
        public readonly deletedAt?: Date | null,
        public readonly actorName?: string,
    ) { }

    static calculateTotals(items: InvoiceItem[], taxRate: number = 0.20): { subtotal: number, taxAmount: number, total: number } {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const taxAmount = subtotal * taxRate;
        const total = subtotal + taxAmount;
        return { subtotal, taxAmount, total };
    }

    public canTransitionTo(newStatus: InvoiceStatus): boolean {
        if (this.status === newStatus) return true;

        if (this.status === InvoiceStatus.PAID) return false; // Final state
        if (this.status === InvoiceStatus.CANCELLED) return false; // Final state

        switch (newStatus) {
            case InvoiceStatus.SENT:
                return this.status === InvoiceStatus.DRAFT;
            case InvoiceStatus.PAID:
                return this.status === InvoiceStatus.SENT || this.status === InvoiceStatus.OVERDUE;
            case InvoiceStatus.OVERDUE:
                return this.status === InvoiceStatus.SENT;
            case InvoiceStatus.CANCELLED:
                return this.status === InvoiceStatus.DRAFT || this.status === InvoiceStatus.SENT || this.status === InvoiceStatus.OVERDUE;
            case InvoiceStatus.DRAFT:
                return false; // Cannot go back to draft once sent
            default:
                return false;
        }
    }
}
