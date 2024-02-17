import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  private middlewares: any = [LoggerMiddleware];
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(this.middlewares)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
