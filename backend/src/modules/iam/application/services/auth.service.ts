import { Inject, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashingService } from './hashing.service';
import { UserRepositoryPort, USER_REPOSITORY } from '../../domain/ports/user.repository.port';
import type { UserRepositoryPort as UserRepositoryPortType } from '../../domain/ports/user.repository.port';
import { TenantRepositoryPort, TENANT_REPOSITORY } from '../../domain/ports/tenant.repository.port';
import type { TenantRepositoryPort as TenantRepositoryPortType } from '../../domain/ports/tenant.repository.port';

@Injectable()
export class AuthService {
    constructor(
        @Inject(USER_REPOSITORY) private userRepo: UserRepositoryPortType,
        @Inject(TENANT_REPOSITORY) private tenantRepo: TenantRepositoryPortType,
        private hashingService: HashingService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userRepo.findByEmailGlobal(email);

        if (!user) return null;

        const props = user.getProps();
        const isMatch = await this.hashingService.compare(pass, props.passwordHash);

        if (!isMatch) return null;

        // Block login if email not verified
        if (!props.emailVerified) {
            throw new UnauthorizedException('EMAIL_NOT_VERIFIED');
        }

        return {
            sub: user.id,
            email: props.email,
            role: props.role,
            tenantId: props.tenantId,
            name: `${props.firstName ?? ''} ${props.lastName ?? ''}`.trim(),
        };
    }

    async login(user: any) {
        const payload = {
            sub: user.sub,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        };

        return {
            accessToken: this.jwtService.sign(payload),
        };
    }

    async verifyEmail(token: string): Promise<void> {
        console.log('[VERIFY] Token reçu:', token.substring(0, 10) + '...');
        console.log('[VERIFY] Longueur token:', token.length);
        const user = await this.userRepo.findByVerificationToken(token);
        console.log('[AuthService] verifyEmail — user trouvé:', user ? `id=${user.id} email=${user.email}` : 'null');
        if (!user) {
            throw new BadRequestException('Lien de vérification invalide ou expiré.');
        }
        await this.userRepo.verifyEmail(user.id);
        console.log('[AuthService] verifyEmail — emailVerified mis à true pour user:', user.id);
    }
}
