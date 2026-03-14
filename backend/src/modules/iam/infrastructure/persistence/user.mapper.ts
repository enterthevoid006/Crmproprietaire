import { User as PrismaUser, Role } from '@prisma/client';
import { User } from '../../domain/entities/user.entity';

export class UserMapper {
    static toDomain(raw: PrismaUser): User {
        return User.create(
            {
                email: raw.email,
                role: raw.role,
                passwordHash: raw.password,
                firstName: raw.firstName,
                lastName: raw.lastName,
                tenantId: raw.tenantId,
                emailVerified: raw.emailVerified,
                emailVerificationToken: raw.emailVerificationToken,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt,
            },
            raw.id,
        );
    }

    static toPersistence(user: User): Omit<PrismaUser, 'createdAt' | 'updatedAt'> {
        const props = (user as any).props;
        return {
            id: user.id,
            email: user.email,
            password: props.passwordHash,
            role: props.role,
            firstName: props.firstName,
            lastName: props.lastName,
            tenantId: user.tenantId,
            emailVerified: props.emailVerified,
            emailVerificationToken: props.emailVerificationToken,
        };
    }
}
