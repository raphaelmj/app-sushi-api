import { AuthSuperMiddleware } from './../middlewares/auth-super.middleware';
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { ServicesModule } from 'src/services/services.module';
import { AuthSimpleMiddleware } from 'src/middlewares/auth-simple.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/User';
import { AuthSuperController } from './auth-super/auth-super.controller';


@Module({
    imports: [ServicesModule, TypeOrmModule.forFeature([User])],
    controllers: [AuthController, AuthSuperController]
})
export class AuthModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthSimpleMiddleware)
            .forRoutes({ path: 'api/auth/logout', method: RequestMethod.GET })
        consumer.apply(AuthSuperMiddleware)
            .forRoutes(AuthSuperController)
    }
}
