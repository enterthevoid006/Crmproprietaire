import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RegisterTenantUseCase, RegisterTenantRequest } from './application/use-cases/register-tenant.use-case';
import { DomainError } from '../core/domain/domain.error';
import { AuthService } from './application/services/auth.service';

@Controller('iam')
export class IamController {
    constructor(
        private readonly registerTenantUseCase: RegisterTenantUseCase,
        private readonly authService: AuthService
    ) { }

    @Post('register')
    async register(@Body() request: RegisterTenantRequest) {
        try {
            const result = await this.registerTenantUseCase.execute(request);
            return result;
        } catch (error) {
            if (error instanceof DomainError) {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @Post('login')
    async login(@Body() req: { email: string; password: string }) {
        const user = await this.authService.validateUser(req.email, req.password);
        if (!user) {
            throw new BadRequestException('Invalid credentials');
        }
        return this.authService.login(user);
    }
}
