import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WinstonLoggerService } from './common/services/winston-logger.service';
import { LoggingMiddleware } from './common/middlewares/logging.middleware';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`
    })],
  controllers: [AppController],
  providers: [
    AppService,
    WinstonLoggerService
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
