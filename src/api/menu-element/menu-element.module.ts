import { MenuElement } from 'src/entities/MenuElement';
import { CartCategory } from './../../entities/CartCategory';
import { MenuCategory } from 'src/entities/MenuCategory';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from './../../services/services.module';
import { Module } from '@nestjs/common';
import { MenuElementController } from './menu-element.controller';

@Module({
  controllers: [MenuElementController],
  imports: [
    ServicesModule,
    TypeOrmModule.forFeature([
      MenuCategory,
      CartCategory,
      MenuElement,
    ]),
  ]
})
export class MenuElementModule { }
