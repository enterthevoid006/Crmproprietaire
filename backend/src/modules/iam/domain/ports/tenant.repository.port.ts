import { Tenant } from '../entities/tenant.entity';

export interface TenantRepositoryPort {
    save(tenant: Tenant): Promise<void>;
    findById(id: string): Promise<Tenant | null>;
    findBySlug(slug: string): Promise<Tenant | null>;
}

export const TENANT_REPOSITORY = Symbol('TENANT_REPOSITORY');
