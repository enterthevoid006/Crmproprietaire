import { Module, Global } from '@nestjs/common';
import { AuditService } from './audit.service';
import { PrismaModule } from '../../shared/infrastructure/prisma/prisma.module';

@Global() // Make it global so we can use it everywhere without importing AuditModule constantly
@Module({
    imports: [PrismaModule],
    providers: [AuditService],
    exports: [AuditService],
})
export class AuditModule { }
