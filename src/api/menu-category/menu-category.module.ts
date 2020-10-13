import { TypeOrmModule } from '@nestjs/typeorm';
import { CartCategory } from './../../entities/CartCategory';
import { MenuCategory } from './../../entities/MenuCategory';
import { MenuCategoryService } from './../../services/menu-category/menu-category.service';
import { MenuCategoryController } from './menu-category.controller';
import { Module } from '@nestjs/common';
import { MenuElement } from 'src/entities/MenuElement';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MenuCategory,
            CartCategory,
            MenuElement,
        ]),
    ],
    controllers: [MenuCategoryController],
    providers: [MenuCategoryService]
})
export class MenuCategoryModule {


}
