import { MenuCategory } from 'src/entities/MenuCategory';
import { CartCategory } from 'src/entities/CartCategory';
import { MenuElement } from 'src/entities/MenuElement';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from './../../services/services.module';
import { Module } from '@nestjs/common';
import { CartCategoryController } from './cart-category.controller';

@Module({
  imports: [
    ServicesModule,
    TypeOrmModule.forFeature([
      MenuCategory,
      CartCategory,
      MenuElement,
    ]),
  ],
  controllers: [CartCategoryController]
})
export class CartCategoryModule { }
