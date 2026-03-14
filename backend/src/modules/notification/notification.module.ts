import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationCron } from './cron/notification.cron';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { EmailService } from '../../shared/infrastructure/email/email.service';

@Module({
    imports: [ScheduleModule.forRoot()],
    controllers: [NotificationController],
    providers: [
        PrismaService,
        EmailService,
        NotificationService,
        NotificationCron,
    ],
    exports: [NotificationService],
})
export class NotificationModule {}
