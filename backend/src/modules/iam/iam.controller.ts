import { Controller, Post, Get, Patch, Delete, Body, Param, Req, BadRequestException, UnauthorizedException, NotFoundException, ForbiddenException, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { randomUUID } from 'crypto';
import { RegisterTenantUseCase, RegisterTenantRequest } from './application/use-cases/register-tenant.use-case';
import { DomainError } from '../core/domain/domain.error';
import { AuthService } from './application/services/auth.service';
import { HashingService } from './application/services/hashing.service';
import { JwtAuthGuard } from './infrastructure/authentication/jwt-auth.guard';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { EmailService } from '../../shared/infrastructure/email/email.service';

@Controller('iam')
export class IamController {
    constructor(
        private readonly registerTenantUseCase: RegisterTenantUseCase,
        private readonly authService: AuthService,
        private readonly hashingService: HashingService,
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
    ) { }

    // ─── Auth ──────────────────────────────────────────────────────────────────

    @Throttle({ default: { limit: 5, ttl: 3600000 } })
    @Post('register')
    async register(@Body() request: RegisterTenantRequest) {
        console.log('[IAM] POST /register received', { tenantName: request.tenantName, email: request.email });
        try {
            return await this.registerTenantUseCase.execute(request);
        } catch (error) {
            console.error('[IAM] POST /register error', error);
            if (error instanceof DomainError) {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }

    @Get('verify/:token')
    async verifyEmail(@Param('token') token: string) {
        await this.authService.verifyEmail(token);
        return { message: 'Email vérifié. Vous pouvez maintenant vous connecter.' };
    }

    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @Post('login')
    async login(@Body() req: { email: string; password: string }) {
        try {
            const user = await this.authService.validateUser(req.email, req.password);
            if (!user) {
                throw new BadRequestException('Identifiants invalides.');
            }
            return this.authService.login(user);
        } catch (e) {
            if (e instanceof UnauthorizedException && (e.message === 'EMAIL_NOT_VERIFIED')) {
                throw new UnauthorizedException('Veuillez vérifier votre email avant de vous connecter.');
            }
            throw e;
        }
    }

    // ─── Tenant Profile ────────────────────────────────────────────────────────

    @Get('tenant')
    @UseGuards(JwtAuthGuard)
    async getTenantProfile(@Req() req: any) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: req.user.tenantId },
            select: {
                id: true, name: true, address: true, city: true, postalCode: true,
                logoUrl: true, companyName: true, siret: true, vatNumber: true,
                country: true, phone: true, email: true, paymentTerms: true, quoteValidityDays: true,
            },
        });
        if (!tenant) throw new NotFoundException('Tenant not found');
        return tenant;
    }

    @Patch('tenant')
    @UseGuards(JwtAuthGuard)
    async updateTenantProfile(@Req() req: any, @Body() body: {
        name?: string; address?: string; city?: string; postalCode?: string;
        logoUrl?: string; companyName?: string; siret?: string; vatNumber?: string;
        country?: string; phone?: string; email?: string; paymentTerms?: string; quoteValidityDays?: number;
    }) {
        const updated = await this.prisma.tenant.update({
            where: { id: req.user.tenantId },
            data: {
                ...(body.name !== undefined && { name: body.name }),
                ...(body.address !== undefined && { address: body.address }),
                ...(body.city !== undefined && { city: body.city }),
                ...(body.postalCode !== undefined && { postalCode: body.postalCode }),
                ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
                ...(body.companyName !== undefined && { companyName: body.companyName }),
                ...(body.siret !== undefined && { siret: body.siret }),
                ...(body.vatNumber !== undefined && { vatNumber: body.vatNumber }),
                ...(body.country !== undefined && { country: body.country }),
                ...(body.phone !== undefined && { phone: body.phone }),
                ...(body.email !== undefined && { email: body.email }),
                ...(body.paymentTerms !== undefined && { paymentTerms: body.paymentTerms }),
                ...(body.quoteValidityDays !== undefined && { quoteValidityDays: body.quoteValidityDays }),
            },
            select: {
                id: true, name: true, address: true, city: true, postalCode: true,
                logoUrl: true, companyName: true, siret: true, vatNumber: true,
                country: true, phone: true, email: true, paymentTerms: true, quoteValidityDays: true,
            },
        });
        return updated;
    }

    // ─── Team Management ───────────────────────────────────────────────────────

    @Post('team/invite')
    @UseGuards(JwtAuthGuard)
    async inviteTeamMember(@Req() req: any, @Body() body: { email: string; role?: string }) {
        // Only OWNER or ADMIN can invite
        if (req.user.role !== 'OWNER' && req.user.role !== 'ADMIN') {
            throw new ForbiddenException('Seuls les administrateurs peuvent inviter des membres.');
        }

        if (!body.email || !body.email.includes('@')) {
            throw new BadRequestException('Adresse email invalide.');
        }

        const normalizedEmail = body.email.toLowerCase().trim();

        // Check not already a member of this tenant
        const existing = await this.prisma.user.findFirst({
            where: { email: normalizedEmail, tenantId: req.user.tenantId },
        });
        if (existing) {
            throw new BadRequestException('Cet utilisateur est déjà membre de votre équipe.');
        }

        // Expire any previous pending invitations for same email+tenant
        await this.prisma.teamInvitation.updateMany({
            where: { email: normalizedEmail, tenantId: req.user.tenantId, status: 'PENDING' },
            data: { status: 'EXPIRED' },
        });

        const token = randomUUID();
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

        const invitation = await this.prisma.teamInvitation.create({
            data: {
                email: normalizedEmail,
                tenantId: req.user.tenantId,
                invitedByUserId: req.user.sub,
                token,
                role: (body.role ?? 'USER') as any,
                status: 'PENDING',
                expiresAt,
            },
        });

        const tenant = await this.prisma.tenant.findUnique({
            where: { id: req.user.tenantId },
            select: { name: true },
        });

        await this.emailService.sendInvitationEmail(
            normalizedEmail,
            token,
            tenant?.name ?? 'votre équipe',
            req.user.email,
        );

        console.log(`[IAM] Invitation sent to ${normalizedEmail} by ${req.user.email} (tenant ${req.user.tenantId})`);
        return { message: `Invitation envoyée à ${normalizedEmail}`, invitationId: invitation.id };
    }

    @Get('team/members')
    @UseGuards(JwtAuthGuard)
    async getTeamMembers(@Req() req: any) {
        const members = await this.prisma.user.findMany({
            where: { tenantId: req.user.tenantId },
            select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        });
        return members;
    }

    @Delete('team/members/:userId')
    @UseGuards(JwtAuthGuard)
    async removeTeamMember(@Req() req: any, @Param('userId') userId: string) {
        if (req.user.role !== 'OWNER' && req.user.role !== 'ADMIN') {
            throw new ForbiddenException('Permission insuffisante.');
        }

        if (userId === req.user.sub) {
            throw new BadRequestException('Vous ne pouvez pas vous retirer de votre propre équipe.');
        }

        const member = await this.prisma.user.findFirst({
            where: { id: userId, tenantId: req.user.tenantId },
        });
        if (!member) throw new NotFoundException('Membre introuvable.');

        if (member.role === 'OWNER') {
            throw new BadRequestException('Impossible de retirer le propriétaire de l\'équipe.');
        }

        await this.prisma.user.delete({ where: { id: userId } });
        return { message: 'Membre retiré de l\'équipe.' };
    }

    // ─── Accept Invite (public) ────────────────────────────────────────────────

    @Get('accept-invite/:token')
    async getInviteInfo(@Param('token') token: string) {
        const invitation = await this.prisma.teamInvitation.findUnique({
            where: { token },
            include: { tenant: { select: { name: true } } },
        });

        if (!invitation) throw new NotFoundException('Invitation introuvable ou invalide.');

        if (invitation.status === 'ACCEPTED') {
            throw new BadRequestException('Cette invitation a déjà été utilisée.');
        }

        if (invitation.status === 'EXPIRED' || invitation.expiresAt < new Date()) {
            if (invitation.status !== 'EXPIRED') {
                await this.prisma.teamInvitation.update({ where: { token }, data: { status: 'EXPIRED' } });
            }
            throw new BadRequestException('Cette invitation a expiré (validité 48h).');
        }

        const existingUser = await this.prisma.user.findUnique({ where: { email: invitation.email } });

        return {
            email: invitation.email,
            tenantName: invitation.tenant.name,
            role: invitation.role,
            existingUser: !!existingUser,
        };
    }

    @Post('accept-invite')
    async acceptInvite(@Body() body: { token: string; password: string; firstName?: string; lastName?: string }) {
        const invitation = await this.prisma.teamInvitation.findUnique({
            where: { token: body.token },
        });

        if (!invitation) throw new NotFoundException('Invitation introuvable.');
        if (invitation.status === 'ACCEPTED') throw new BadRequestException('Invitation déjà utilisée.');
        if (invitation.status === 'EXPIRED' || invitation.expiresAt < new Date()) {
            throw new BadRequestException('Invitation expirée.');
        }

        if (!body.password || body.password.length < 8) {
            throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères.');
        }

        const existingUser = await this.prisma.user.findUnique({ where: { email: invitation.email } });
        if (existingUser) {
            throw new BadRequestException('Un compte avec cet email existe déjà. Veuillez vous connecter.');
        }

        const passwordHash = await this.hashingService.hash(body.password);
        const newUserId = randomUUID();

        await this.prisma.user.create({
            data: {
                id: newUserId,
                email: invitation.email,
                password: passwordHash,
                firstName: body.firstName ?? null,
                lastName: body.lastName ?? null,
                tenantId: invitation.tenantId,
                role: invitation.role,
                emailVerified: true, // Invitation = email already trusted
                emailVerificationToken: null,
            },
        });

        await this.prisma.teamInvitation.update({
            where: { token: body.token },
            data: { status: 'ACCEPTED' },
        });

        console.log(`[IAM] Invite accepted: ${invitation.email} joined tenant ${invitation.tenantId}`);

        return this.authService.login({
            sub: newUserId,
            email: invitation.email,
            role: invitation.role,
            tenantId: invitation.tenantId,
        });
    }
}
