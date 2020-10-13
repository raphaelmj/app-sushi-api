import { CartCategoryData } from './../../interfaces/cart-category-data.interface';
import { MenuElementData } from './../../interfaces/menu-element.interface';
import { MenuElement } from 'src/entities/MenuElement';
import { CartCategory } from './../../entities/CartCategory';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, Not } from 'typeorm';
import { map } from 'p-iteration';
import * as slug from "slug"

@Injectable()
export class CartCategoryService {


    constructor(
        @InjectRepository(CartCategory)
        private readonly cartCategoryRepository: Repository<CartCategory>,
        @InjectRepository(MenuElement)
        private readonly menuElementRepository: Repository<MenuElement>,
    ) {

    }

    async getAllCartCategory(): Promise<CartCategory[]> {
        var cartCs: CartCategory[] = await this.cartCategoryRepository.find({ where: { /*isSpecial: false*/ }, order: { ordering: 'ASC' } })
        await map(cartCs, async (c, i) => {
            cartCs[i].elements = await this.menuElementRepository.find({ where: { cartCategory: { id: c.id } }, relations: ['cartCategory'] })
        })
        return cartCs
    }


    async setCartsElements(data: { elements: MenuElementData[], cartCategoryId: number }): Promise<{ elements: MenuElementData[], cartCategoryId: number }> {
        var cc: CartCategory = await this.cartCategoryRepository.findOne(data.cartCategoryId)
        await map(data.elements, async (el, i) => {
            let mel: MenuElement = await this.menuElementRepository.findOne(el.id)
            mel.cartCategory = cc
            await mel.save()
        })
        return data
    }


    async updateCartCategory(cartCategory: CartCategoryData) {
        var isFree = await this.checkIsCartAliasFreeExcept(cartCategory['name'], cartCategory['id'])
        if (isFree) {
            cartCategory.alias = slug(cartCategory.name, { lower: true })
            this.cartCategoryRepository.update(cartCategory.id, cartCategory)
        } else {
            cartCategory.alias = slug(cartCategory.name, { lower: true }) + '-' + cartCategory.id
            this.cartCategoryRepository.update(cartCategory.id, cartCategory)
        }
        return cartCategory
    }


    async checkIsCartAliasFree(name: string): Promise<boolean> {
        var alias = slug(name, { lower: true })
        var c: number = await this.cartCategoryRepository.count({ where: { alias } })
        return c < 1
    }

    async checkIsCartAliasFreeExcept(name: string, id: number): Promise<boolean> {
        var alias = slug(name, { lower: true })
        var c: number = await this.cartCategoryRepository.count({ where: { alias, id: Not(id) } })
        return c < 1
    }

}
