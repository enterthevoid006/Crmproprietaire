import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service'; // TODO: Create this service
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';
import { UserMapper } from './user.mapper'; // TODO: Create Mapper

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
    constructor(private prisma: PrismaService) { }

    async save(user: User): Promise<void> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        // Safety check: Ensure the domain entity tenant matches the context
        if (user.tenantId !== tenantId) {
            throw new Error('Security Violation: Attempting to save user for different tenant');
        }

        const data = UserMapper.toPersistence(user);

        await this.prisma.user.upsert({
            where: { id: user.id },
            update: { ...data },
            create: { ...data },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        const raw = await this.prisma.user.findFirst({
            where: {
                email,
                tenantId // AUTO-FILTER
            },
        });

        if (!raw) return null;

        return UserMapper.toDomain(raw);
    }

    async findByEmailGlobal(email: string): Promise<User | null> {
        // Bypass TenantContext for login lookup
        const raw = await this.prisma.user.findFirst({
            where: { email },
        });

        if (!raw) return null;

        return UserMapper.toDomain(raw);
    }

    async findById(id: string): Promise<User | null> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        const raw = await this.prisma.user.findFirst({
            where: {
                id,
                tenantId // AUTO-FILTER
            },
        });

        if (!raw) return null;

        return UserMapper.toDomain(raw);
    }
}
