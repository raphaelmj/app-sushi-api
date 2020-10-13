import { EventsGateway } from 'src/events.gateway';
import { CartCategory } from './../entities/CartCategory';
import { MenuCategory } from './../entities/MenuCategory';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SiteSchema, Site } from 'src/schemas/site.schema';
import { SiteService } from './site/site.service';
import { Anchor, AnchorSchema } from 'src/schemas/anchor.schema';
import { AnchorService } from './anchor/anchor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/User';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { jwtConstants } from 'src/constants';
import { JwtModule } from '@nestjs/jwt';
import { CartOrder } from 'src/entities/CartOrder';
import { CartOrderElement } from 'src/entities/CartOrderElement';
import { CartOrderService } from './cart-order/cart-order.service';
import { OrdersService } from './orders/orders.service';
import { MenuElementsService } from './menu-elements/menu-elements.service';
import { MenuElement } from 'src/entities/MenuElement';
import { MenuCategoryService } from './menu-category/menu-category.service';
import { CartCategoryService } from './cart-category/cart-category.service';
import { ReverseOptionsService } from './reverse-options/reverse-options.service';
import { DescOptionsService } from './desc-options/desc-options.service';
import { ReverseOptions } from 'src/entities/ReverseOptions';
import { DescOptions } from 'src/entities/DescOptions';
import { CalculateService } from './calculate/calculate.service';
import { ReservationTimeCheckService } from './reservation-time-check/reservation-time-check.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Site.name, schema: SiteSchema },
      { name: Anchor.name, schema: AnchorSchema },
    ]),
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
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '86400s' },
    }),
  ],
  providers: [
    SiteService,
    AnchorService,
    AuthService,
    PasswordService,
    CartOrderService,
    OrdersService,
    MenuElementsService,
    MenuCategoryService,
    CartCategoryService,
    ReverseOptionsService,
    DescOptionsService,
    CalculateService,
    ReservationTimeCheckService,
    EventsGateway

  ],
  exports: [
    SiteService,
    AnchorService,
    AuthService,
    PasswordService,
    CartOrderService,
    OrdersService,
    MenuElementsService,
    CartCategoryService,
    ReverseOptionsService,
    DescOptionsService,
    CalculateService,
    ReservationTimeCheckService
  ],
})
export class ServicesModule { }
