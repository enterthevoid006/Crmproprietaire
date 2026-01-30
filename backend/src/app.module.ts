import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IamModule } from './modules/iam/iam.module';
import { ActorModule } from './modules/actor/actor.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OpportunityModule } from './modules/opportunity/opportunity.module';
import { InteractionModule } from './modules/interaction/interaction.module';
import { TaskModule } from './modules/task/task.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { DocumentModule } from './modules/document/document.module';
import { FinanceModule } from './modules/finance/finance.module';
import { validate } from './shared/infrastructure/env/env.validation';
import { AuditModule } from './modules/audit/audit.module';
import { TenantMiddleware } from './shared/infrastructure/middleware/tenant.middleware';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 300,
    }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    IamModule,
    ActorModule,
    OpportunityModule,
    InteractionModule,
    TaskModule,
    AgendaModule,
    DocumentModule,
    FinanceModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
