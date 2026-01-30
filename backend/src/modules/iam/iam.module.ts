import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { IamController } from './iam.controller';
import { RegisterTenantUseCase } from './application/use-cases/register-tenant.use-case';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { PrismaTenantRepository } from './infrastructure/persistence/prisma-tenant.repository';
import { USER_REPOSITORY } from './domain/ports/user.repository.port';
import { TENANT_REPOSITORY } from './domain/ports/tenant.repository.port';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { AuthService } from './application/services/auth.service';
import { HashingService } from './application/services/hashing.service';
import { JwtStrategy } from './infrastructure/authentication/jwt.strategy';

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1h' },
            }),
        }),
    ],
    controllers: [IamController],
    providers: [
        PrismaService,
        RegisterTenantUseCase,
        AuthService,
        HashingService,
        JwtStrategy,
        {
            provide: USER_REPOSITORY,
            useClass: PrismaUserRepository,
        },
        {
            provide: TENANT_REPOSITORY,
            useClass: PrismaTenantRepository,
        },
    ],
    exports: [RegisterTenantUseCase, AuthService],
})
export class IamModule { }
