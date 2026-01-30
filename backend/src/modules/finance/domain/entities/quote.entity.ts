
export enum QuoteStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    EXPIRED = 'EXPIRED'
}

export interface QuoteItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export class Quote {
    constructor(
        public readonly id: string,
        public readonly tenantId: string,
        public readonly actorId: string,
        public readonly number: string,
        public readonly date: Date,
        public readonly validUntil: Date,
        public readonly status: QuoteStatus,
        public readonly items: QuoteItem[],
        public readonly subtotal: number,
        public readonly taxAmount: number,
        public readonly total: number,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly opportunityId?: string,
        public readonly actorName?: string,
    ) { }

    static calculateTotals(items: QuoteItem[], taxRate: number = 0.20): { subtotal: number, taxAmount: number, total: number } {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const taxAmount = subtotal * taxRate;
        const total = subtotal + taxAmount;
        return { subtotal, taxAmount, total };
    }

    public canTransitionTo(newStatus: QuoteStatus): boolean {
        if (this.status === newStatus) return true;

        if (this.status === QuoteStatus.ACCEPTED) return false; // Final state
        if (this.status === QuoteStatus.REJECTED) return false; // Final state

        switch (newStatus) {
            case QuoteStatus.SENT:
                return this.status === QuoteStatus.DRAFT;
            case QuoteStatus.ACCEPTED:
                return this.status === QuoteStatus.SENT || this.status === QuoteStatus.EXPIRED; // Can revive expired?
            case QuoteStatus.REJECTED:
                return this.status === QuoteStatus.SENT || this.status === QuoteStatus.EXPIRED;
            case QuoteStatus.EXPIRED:
                return this.status === QuoteStatus.SENT;
            case QuoteStatus.DRAFT:
                return false; // Cannot go back to draft once sent
            default:
                return false;
        }
    }
}
