import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { TenantRepositoryPort } from '../../domain/ports/tenant.repository.port';
import { Tenant } from '../../domain/entities/tenant.entity';

@Injectable()
export class PrismaTenantRepository implements TenantRepositoryPort {
    constructor(private prisma: PrismaService) { }

    async save(tenant: Tenant): Promise<void> {
        // Tenant creation is usually a system-level operation or public registration,
        // so we might not enforce TenantContext check here depending on the use case.
        // For registration, there is no tenant yet.

        const props = tenant.getProps();
        const data = {
            id: tenant.id,
            name: props.name,
            slug: props.slug,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };

        await this.prisma.tenant.upsert({
            where: { id: tenant.id },
            update: { ...data },
            create: { ...data },
        });
    }

    async findById(id: string): Promise<Tenant | null> {
        const raw = await this.prisma.tenant.findUnique({ where: { id } });
        if (!raw) return null;

        // Simple mapper inline for now
        return Tenant.create({
            name: raw.name,
            slug: raw.slug,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        }, raw.id);
    }

    async findBySlug(slug: string): Promise<Tenant | null> {
        const raw = await this.prisma.tenant.findUnique({ where: { slug } });
        if (!raw) return null;

        return Tenant.create({
            name: raw.name,
            slug: raw.slug,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        }, raw.id);
    }
}
