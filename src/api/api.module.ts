import { EsServicesModule } from './../es-services/es-services.module';
import { AppConfig } from 'src/entities/AppConfig';
import { CartCategory } from './../entities/CartCategory';
import { MenuCategory } from './../entities/MenuCategory';
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ServicesModule } from 'src/services/services.module';
import { DataController } from './data/data.controller';
import { OrdersController } from './orders/orders.controller';
import { EventsGateway } from 'src/events.gateway';
import { AuthSimpleMiddleware } from 'src/middlewares/auth-simple.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/User';
import { CartOrder } from 'src/entities/CartOrder';
import { CartOrderElement } from 'src/entities/CartOrderElement';
import { DescOptions } from 'src/entities/DescOptions';
import { ReverseOptions } from 'src/entities/ReverseOptions';
import { MenuElement } from 'src/entities/MenuElement';
import { MenuCategoryModule } from './menu-category/menu-category.module';
import { CartCategoryModule } from './cart-category/cart-category.module';
import { MenuElementModule } from './menu-element/menu-element.module';
import { OptionsConfigModule } from './options-config/options-config.module';

@Module({
  imports: [
    ServicesModule,
    TypeOrmModule.forFeature([
      User,
      CartOrder,
      CartOrderElement,
      DescOptions,
      ReverseOptions,
      AppConfig
    ]),
    MenuCategoryModule,
    CartCategoryModule,
    MenuElementModule,
    OptionsConfigModule,
    EsServicesModule
  ],
  controllers: [DataController, OrdersController],
  providers: [EventsGateway],
})
export class ApiModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthSimpleMiddleware)
  }
}
