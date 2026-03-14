import { Controller, Get, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../iam/infrastructure/authentication/jwt-auth.guard';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    async getUnread(@Req() req: any) {
        return this.notificationService.getUnread(req.user.sub, req.user.tenantId);
    }

    // read-all MUST be declared before :id/read to avoid routing conflict
    @Patch('read-all')
    async markAllRead(@Req() req: any) {
        await this.notificationService.markAllRead(req.user.sub, req.user.tenantId);
        return { message: 'Toutes les notifications ont été marquées comme lues.' };
    }

    @Patch(':id/read')
    async markRead(@Param('id') id: string, @Req() req: any) {
        await this.notificationService.markRead(id, req.user.sub);
        return { message: 'Notification marquée comme lue.' };
    }
}
