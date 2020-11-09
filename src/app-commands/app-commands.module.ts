import { EsServicesModule } from './../es-services/es-services.module';
import { AppConfigSubscriber } from './../entities/subscriptions/AppConfigSubscriber';
import { RefactorDataCommandService } from './refactor-data-commands.service';
import { CartCategorySubscriber } from './../entities/subscriptions/CartCategorySubscriber';
import { MenuElement } from './../entities/MenuElement';
import { CartCategory } from './../entities/CartCategory';
import { MenuCategory } from './../entities/MenuCategory';
import { MenuElementSubscriber } from './../entities/subscriptions/MenuElementSubscriber';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsoleModule } from 'nestjs-console';
import { User } from 'src/entities/User';
import { ServicesModule } from 'src/services/services.module';
import { UserCommandService } from './user-command.service';
import { CartOrder } from 'src/entities/CartOrder';
import { CartOrderElement } from 'src/entities/CartOrderElement';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersCommandService } from './orders-commands.service';
import { CartOrderElementSubscriber } from 'src/entities/subscriptions/CartOrderElementSubscriber';
import { OptionsCommandsService } from './options-commands.service';
import { DescOptions } from 'src/entities/DescOptions';
import { ReverseOptions } from 'src/entities/ReverseOptions';
import { DescOptionsSubscriber } from 'src/entities/subscriptions/DescOptionsSubscriber';
import { ReverseOptionsSubscriber } from 'src/entities/subscriptions/ReverseOptionsSubscriber';
import { Site, SiteSchema } from 'src/schemas/site.schema';
import { Anchor, AnchorSchema } from 'src/schemas/anchor.schema';
import { ImportFromMongoService } from './import-from-mongo.service';
import { AppConfig } from 'src/entities/AppConfig';
import { ConfigService } from './config.service';
import { OptionsCreateCommamdsService } from './options-create-commamds.service';
import { EsCommandsService } from './es-commands.service';
import { RandomDecimalPricesService } from './random-decimal-prices.service';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://mo1239_mo:Mo1234@mongo27.mydevil.net/mo1239_mo',
    ),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'mydb',
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
      // synchronize: true,
      // logging: true
    }),
    TypeOrmModule.forFeature([
      User,
      CartOrder,
      CartOrderElement,
      MenuCategory,
      CartCategory,
      MenuElement,
    ]),
    ConsoleModule,
    ServicesModule,
    EsServicesModule,
  ],
  providers: [
    UserCommandService,
    OrdersCommandService,
    OptionsCommandsService,
    ImportFromMongoService,
    RefactorDataCommandService,
    ConfigService,
    OptionsCreateCommamdsService,
    EsCommandsService,
    RandomDecimalPricesService,
  ],
  exports: [
    UserCommandService,
    OrdersCommandService,
    OptionsCommandsService,
    ImportFromMongoService,
    RefactorDataCommandService,
    ConfigService,
    OptionsCreateCommamdsService,
    EsCommandsService,
    RandomDecimalPricesService,
  ],
})
export class AppCommandsModule { }
