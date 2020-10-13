import { AppConfigSubscriber } from './entities/subscriptions/AppConfigSubscriber';
import { AppConfig } from './entities/AppConfig';
import { CartCategorySubscriber } from './entities/subscriptions/CartCategorySubscriber';
import { CartCategory } from './entities/CartCategory';
import { MenuCategory } from './entities/MenuCategory';
import { MenuElementSubscriber } from './entities/subscriptions/MenuElementSubscriber';
import { MenuElement } from './entities/MenuElement';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EventsGateway } from './events.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesModule } from './services/services.module';
import { ApiModule } from './api/api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/User';
import { AuthModule } from './auth/auth.module';
import { CartOrder } from './entities/CartOrder';
import { CartOrderElement } from './entities/CartOrderElement';
import { CartOrderElementSubscriber } from './entities/subscriptions/CartOrderElementSubscriber';
import { DescOptions } from './entities/DescOptions';
import { ReverseOptions } from './entities/ReverseOptions';
import { DescOptionsSubscriber } from './entities/subscriptions/DescOptionsSubscriber';
import { ReverseOptionsSubscriber } from './entities/subscriptions/ReverseOptionsSubscriber';
import { EsModule } from './es/es.module';
import { EsServicesModule } from './es-services/es-services.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppJobsService } from './app-jobs.service';


@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://...',
    ),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'base',
      entities: [
        User,
        CartOrder,
        CartOrderElement,
        DescOptions,
        ReverseOptions,
        MenuCategory,
        CartCategory,
        MenuElement,
        AppConfig
      ],
      subscribers: [
        CartOrderElementSubscriber,
        DescOptionsSubscriber,
        ReverseOptionsSubscriber,
        MenuElementSubscriber,
        CartCategorySubscriber,
        AppConfigSubscriber
      ],
      synchronize: true,
      // logging: true
    }),
    TypeOrmModule.forFeature([
      User,
      CartOrder,
      CartOrderElement,
      MenuCategory,
      CartCategory,
      MenuElement,
      ReverseOptions,
      DescOptions
    ]),
    ServicesModule,
    ApiModule,
    AuthModule,
    EsModule,
    EsServicesModule,
  ],
  controllers: [AppController],
  providers: [EventsGateway, AppJobsService],
})
export class AppModule { }
