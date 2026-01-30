import { Entity } from '../../../core/domain/entity';

export interface TenantProps {
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Tenant extends Entity<TenantProps> {
    private constructor(props: TenantProps, id?: string) {
        super(props, id);
    }

    static create(props: TenantProps, id?: string): Tenant {
        return new Tenant(props, id);
    }
}
