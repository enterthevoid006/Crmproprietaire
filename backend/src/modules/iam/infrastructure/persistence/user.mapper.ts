import { User as PrismaUser, Role } from '@prisma/client';
import { User } from '../../domain/entities/user.entity';

export class UserMapper {
    static toDomain(raw: PrismaUser): User {
        return User.create(
            {
                email: raw.email,
                role: raw.role, // Map from DB
                passwordHash: raw.password,
                firstName: raw.firstName,
                lastName: raw.lastName,
                tenantId: raw.tenantId,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt,
            },
            raw.id,
        );
    }

    static toPersistence(user: User): Omit<PrismaUser, 'id' | 'createdAt' | 'updatedAt'> & { id: string } {
        return {
            id: user.id,
            email: user.email,
            password: (user as any).props.passwordHash, // Accessing protected props via cast or add getter
            role: (user as any).props.role,
            firstName: (user as any).props.firstName,
            lastName: (user as any).props.lastName,
            tenantId: user.tenantId,
        };
    }
}
