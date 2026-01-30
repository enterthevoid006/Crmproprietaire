import { Tenant } from '../../../iam/domain/entities/tenant.entity';

export class Document {
    constructor(
        public readonly id: string,
        public readonly tenantId: string,
        public readonly filename: string,
        public readonly path: string,
        public readonly mimeType: string,
        public readonly size: number,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly actorId?: string,
        public readonly opportunityId?: string,
    ) { }
}
