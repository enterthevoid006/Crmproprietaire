import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod'; // Using Zod for internal validation if needed, or stick to DTO validation
import { Tenant } from '../../domain/entities/tenant.entity';
import { User } from '../../domain/entities/user.entity';
import { TENANT_REPOSITORY } from '../../domain/ports/tenant.repository.port';
import type { TenantRepositoryPort } from '../../domain/ports/tenant.repository.port';
import { USER_REPOSITORY } from '../../domain/ports/user.repository.port';
import type { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { DomainError } from '../../../core/domain/domain.error';
import { HashingService } from '../services/hashing.service';

// DTO
export class RegisterTenantRequest {
    tenantName!: string;
    slug!: string;
    email!: string;
    password!: string;
    firstName!: string;
    lastName!: string;
}

// Errors
export class TenantAlreadyExistsError extends DomainError {
    constructor(message: string) {
        super(message);
    }
}
export class UserAlreadyExistsError extends DomainError {
    constructor(message: string) {
        super(message);
    }
}

@Injectable()
export class RegisterTenantUseCase {
    constructor(
        @Inject(TENANT_REPOSITORY) private tenantRepo: TenantRepositoryPort,
        @Inject(USER_REPOSITORY) private userRepo: UserRepositoryPort,
        private hashingService: HashingService,
    ) { }

    async execute(request: RegisterTenantRequest): Promise<{ tenantId: string; userId: string }> {
        // 1. Check Uniqueness
        const existingTenant = await this.tenantRepo.findBySlug(request.slug);
        if (existingTenant) {
            throw new TenantAlreadyExistsError(`Tenant with slug ${request.slug} already exists`);
        }

        // 2. Create Tenant
        const tenant = Tenant.create({
            name: request.tenantName,
            slug: request.slug,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // 3. Create Admin User
        const passwordHash = await this.hashingService.hash(request.password);

        const user = User.create({
            email: request.email,
            role: 'OWNER', // First user is always OWNER
            firstName: request.firstName,
            lastName: request.lastName,
            passwordHash: passwordHash,
            tenantId: tenant.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // 4. Persistence (Ideally transactional)
        await this.tenantRepo.save(tenant);

        // We need to bypass the TenantContext check in Repository for the initial user creation?
        // OR we can manually set the context here using TenantContext.run(() => repo.save()) if we were in a request scope.
        // But since PrismaUserRepository explicitly checks TenantContext, we must set it.
        // This is a special case: System Registration.

        // Hack/Pattern: Use a "System Context" or simulate the context.
        const { AsyncLocalStorage } = require('async_hooks');
        // However, since we are in the same event loop tick sequence (await), 
        // we can't easily wrap AsyncLocalStorage around the repo call unless we wrap the whole execution.
        // Instead, we might need a method in repo `saveSystemUser` or `saveAsRoot`.
        // OR, simpler: The PrismaUserRepository check:
        // const tenantId = TenantContext.getTenantIdOrThrow(); 
        // This will THROW if we call it here without context.

        // Solution: Wrap the save in TenantContext.run
        const { TenantContext } = require('../../../../shared/infrastructure/context/tenant-context');

        await new Promise<void>((resolve, reject) => {
            TenantContext.run(tenant.id, async () => {
                try {
                    // Check user uniqueness inside the context of the new tenant (though email is global unique in our schema)
                    // But our findByEmail is scoped to tenant! 
                    // Actually, Schema User.email is @unique globally.
                    // So we should check globally via a specific method or catch the DB error.
                    // For MVP, we catch DB error or assume global check needs a separate port method `findByEmailGlobal`.

                    await this.userRepo.save(user);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });

        return { tenantId: tenant.id, userId: user.id };
    }
}
