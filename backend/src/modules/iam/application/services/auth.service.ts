import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashingService } from './hashing.service';
import { UserRepositoryPort, USER_REPOSITORY } from '../../domain/ports/user.repository.port';
import type { UserRepositoryPort as UserRepositoryPortType } from '../../domain/ports/user.repository.port';
import { TenantRepositoryPort, TENANT_REPOSITORY } from '../../domain/ports/tenant.repository.port';
import type { TenantRepositoryPort as TenantRepositoryPortType } from '../../domain/ports/tenant.repository.port';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';

@Injectable()
export class AuthService {
    constructor(
        @Inject(USER_REPOSITORY) private userRepo: UserRepositoryPortType,
        @Inject(TENANT_REPOSITORY) private tenantRepo: TenantRepositoryPortType, // To resolve slug for Multi-Tenancy login
        private hashingService: HashingService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userRepo.findByEmailGlobal(email);

        if (!user) {
            return null;
        }

        const props = user.getProps();
        const isMatch = await this.hashingService.compare(pass, props.passwordHash);

        if (isMatch) {
            return {
                sub: user.id,
                email: props.email,
                role: props.role,
                tenantId: props.tenantId, // Return the tenant ID we found
                name: `${props.firstName} ${props.lastName}`
            };
        }

        return null;
    }

    async login(user: any) {
        const payload = {
            sub: user.sub,
            email: user.email,
            role: user.role, // Pass Role into Token
            tenantId: user.tenantId
        };

        return {
            accessToken: this.jwtService.sign(payload),
        };
    }
}
