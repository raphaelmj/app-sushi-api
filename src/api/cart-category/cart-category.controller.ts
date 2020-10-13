import { map } from 'p-iteration';
import { CartCategory } from './../../entities/CartCategory';
import { CartCategoryService } from './../../services/cart-category/cart-category.service';
import { MenuElement } from 'src/entities/MenuElement';
import { MenuCategory } from 'src/entities/MenuCategory';
import { InjectRepository } from '@nestjs/typeorm';
import { Controller, Get, Res, Param, Post, Body } from '@nestjs/common';
import { Repository } from 'typeorm';

@Controller('/api/cart-category')
export class CartCategoryController {
  constructor(
    @InjectRepository(CartCategory)
    private readonly cartCategoryRepository: Repository<CartCategory>,
    @InjectRepository(MenuCategory)
    private readonly menuCategoryRepository: Repository<MenuCategory>,
    @InjectRepository(MenuElement)
    private readonly menuElementRepository: Repository<MenuElement>,
    private readonly cartCategoryService: CartCategoryService
  ) { }

  @Get('get/cart/elements/:id')
  async getCartElements(@Res() res, @Param() params) {
    return res.json(
      await this.menuElementRepository.find({
        order: { name: 'ASC' },
        where: {
          cartCategory: {
            id: params.id,
          },
        },
      }),
    );
  }
  @Get('get/all/cart/elements')
  async getAllCartElements(@Res() res) {
    return res.json(
      await this.menuElementRepository.find({
        order: { name: 'ASC' }
      }),
    );
  }


  @Get('get/plus/group')
  async getGroup(@Res() res) {

    var qs: CartCategory[] = await this.cartCategoryRepository.find({
      order: {
        ordering: 'ASC'
      },
      where: {
        toPlus: true
      },
      relations: ["elements"],
    })

    await map(qs, async (q, i) => {
      qs[i].elements = q.elements.filter(e => e.showOnPlus)
    })

    return res.json(qs)
  }

  @Get('get/full/list')
  async getAll(@Res() res) {
    return res.json(await this.cartCategoryService.getAllCartCategory())
  }


  @Post('set/cart/elements')
  async setCartElements(@Res() res, @Body() body) {
    return res.json(await this.cartCategoryService.setCartsElements(body))
  }

  @Post('change/field')
  async changeFieldValue(@Res() res, @Body() body) {
    var upD = {}
    upD[body.field] = (body.value)
    return res.json(await this.cartCategoryRepository.update(body.id, upD))
  }

  @Post('update')
  async update(@Res() res, @Body() body) {
    return res.json(await this.cartCategoryService.updateCartCategory(body))
  }

}
