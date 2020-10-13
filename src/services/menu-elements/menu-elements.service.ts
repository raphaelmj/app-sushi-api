import { InjectRepository } from '@nestjs/typeorm';
import { CartCategory } from 'src/entities/CartCategory';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { MenuCategory } from 'src/entities/MenuCategory';
import { MenuElement } from 'src/entities/MenuElement';
import { map } from 'p-iteration';
import { async } from 'rxjs';

@Injectable()
export class MenuElementsService {
  constructor(
    @InjectRepository(CartCategory)
    private readonly cartCategoryRepository: Repository<CartCategory>,
    @InjectRepository(MenuCategory)
    private readonly menuCategoryRepository: Repository<MenuCategory>,
    @InjectRepository(MenuElement)
    private readonly menuElementRepository: Repository<MenuElement>,
  ) { }

  async getMenuCategoryFullData(): Promise<MenuCategory[]> {
    const menu: MenuCategory[] = await this.menuCategoryRepository.find({
      order: {
        ordering: 'ASC'
      },
    });
    await map(menu, async (m, i) => {
      menu[i].elements = await this.menuElementRepository.find({ where: { menuCategory: { id: m.id } }, relations: ["cartCategory"], order: { ordering: "ASC" } })
    })
    return menu;
  }

  async getCartCategories(): Promise<CartCategory[]> {
    return await this.cartCategoryRepository.find({
      order: { ordering: 'ASC' },
    });
  }
}
