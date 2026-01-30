import { Entity } from '../../../core/domain/entity';

export interface UserProps {
    email: string;
    role: string; // Stored as string or enum in domain, mapped from DB
    firstName: string | null;
    lastName: string | null;
    tenantId: string;
    passwordHash: string; // We only deal with hashed passwords in domain
    createdAt: Date;
    updatedAt: Date;
}

export class User extends Entity<UserProps> {
    private constructor(props: UserProps, id?: string) {
        super(props, id);
    }

    // Factory method to enforce creation rules
    static create(props: UserProps, id?: string): User {
        // Add validation logic here (e.g. valid email format via ValueObject)
        return new User(props, id);
    }

    get email(): string {
        return this.props.email;
    }

    get role(): string {
        return this.props.role;
    }

    get tenantId(): string {
        return this.props.tenantId;
    }

    get fullName(): string {
        return [this.props.firstName, this.props.lastName].filter(Boolean).join(' ');
    }
}
