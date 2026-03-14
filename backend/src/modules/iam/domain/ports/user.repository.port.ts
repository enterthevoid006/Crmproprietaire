import { User } from '../entities/user.entity';

export interface UserRepositoryPort {
    save(user: User): Promise<void>;
    findByEmail(email: string): Promise<User | null>;
    findByEmailGlobal(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findByVerificationToken(token: string): Promise<User | null>;
    verifyEmail(userId: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
