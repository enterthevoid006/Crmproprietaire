import { Inject, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { TENANT_REPOSITORY } from '../../domain/ports/tenant.repository.port';
import type { TenantRepositoryPort } from '../../domain/ports/tenant.repository.port';
import { USER_REPOSITORY } from '../../domain/ports/user.repository.port';
import type { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { DomainError } from '../../../core/domain/domain.error';
import { HashingService } from '../services/hashing.service';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { EmailService } from '../../../../shared/infrastructure/email/email.service';

// DTO
export class RegisterTenantRequest {
    @IsString()
    tenantName!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(8)
    password!: string;
}

// Errors
export class TenantAlreadyExistsError extends DomainError {
    constructor(message: string) { super(message); }
}
export class UserAlreadyExistsError extends DomainError {
    constructor(message: string) { super(message); }
}

@Injectable()
export class RegisterTenantUseCase {
    private readonly logger = new Logger(RegisterTenantUseCase.name);

    constructor(
        @Inject(TENANT_REPOSITORY) private tenantRepo: TenantRepositoryPort,
        @Inject(USER_REPOSITORY) private userRepo: UserRepositoryPort,
        private hashingService: HashingService,
        private prisma: PrismaService,
        private emailService: EmailService,
    ) { }

    async execute(request: RegisterTenantRequest): Promise<{ message: string }> {
        // 1. Derive slug from agency name
        const slug = request.tenantName
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        // 2. Uniqueness checks
        const existingTenant = await this.tenantRepo.findBySlug(slug);
        if (existingTenant) {
            throw new TenantAlreadyExistsError('Ce nom d\'agence est déjà utilisé.');
        }

        const existingUser = await this.userRepo.findByEmailGlobal(request.email);
        if (existingUser) {
            throw new UserAlreadyExistsError('Un compte existe déjà avec cet email.');
        }

        // 3. Prepare data
        const tenantId = crypto.randomUUID();
        const userId = crypto.randomUUID();
        const passwordHash = await this.hashingService.hash(request.password);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // 4. Atomic transaction — tenant + user created together or not at all
        await this.prisma.$transaction(async (tx) => {
            await tx.tenant.create({
                data: {
                    id: tenantId,
                    name: request.tenantName,
                    slug,
                },
            });

            await tx.user.create({
                data: {
                    id: userId,
                    email: request.email,
                    password: passwordHash,
                    role: 'OWNER',
                    tenantId,
                    emailVerified: false,
                    emailVerificationToken: verificationToken,
                },
            });
        });

        // 5. Send verification email (non-blocking)
        try {
            await this.emailService.sendVerificationEmail(request.email, verificationToken);
        } catch (err) {
            this.logger.error(`Failed to send verification email to ${request.email}`, err);
        }

        return { message: 'Compte créé. Vérifiez votre email pour activer votre accès.' };
    }
}
