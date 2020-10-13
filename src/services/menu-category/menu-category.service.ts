import { MenuElement } from './../../entities/MenuElement';
import { MenuCategory } from 'src/entities/MenuCategory';
import { InjectRepository } from '@nestjs/typeorm';
import { CartCategory } from './../../entities/CartCategory';
import { Injectable } from '@nestjs/common';
import { Repository, Not } from 'typeorm';
import * as slug from "slug"
import { map } from 'p-iteration';
import { async } from 'rxjs';


@Injectable()
export class MenuCategoryService {
    constructor(
        @InjectRepository(CartCategory)
        private readonly cartCategoryRepository: Repository<CartCategory>,
        @InjectRepository(MenuCategory)
        private readonly menuCategoryRepository: Repository<MenuCategory>,
        @InjectRepository(MenuElement)
        private readonly menuElementRepository: Repository<MenuElement>,
    ) {

    }

    async createNew(menu: any) {
        var nc: MenuCategory
        var m: Record<any, unknown> = menu
        var isFree: boolean = await this.checkIsAliasFree(menu['name'])
        var last: MenuCategory = await this.menuCategoryRepository.findOne({ order: { ordering: 'DESC' } })
        var nextOrd: number = 0
        if (last) {
            nextOrd = last.ordering + 1
        }
        if (isFree) {
            m.alias = slug(menu.name, { lower: true })
            m.ordering = nextOrd
            nc = await this.menuCategoryRepository.create(m).save()

        } else {
            m.ordering = nextOrd
            nc = await this.menuCategoryRepository.create(m).save()
            nc.alias = slug(menu.name, { lower: true }) + "-" + nc.id
            await nc.save()
        }

        return nc
    }


    async update(menu: any) {
        var m: Record<any, unknown> = menu
        var isFree: boolean = await this.checkIsAliasFreeExcept(menu['name'], menu['id'])
        if (!isFree) {
            m.alias = slug(menu.name, { lower: true }) + "-" + menu.id
        }
        return await this.menuCategoryRepository.update(menu.id, m)
    }


    async delete(id: number) {
        return await this.menuCategoryRepository.delete(id)
    }


    private async checkIsAliasFree(name: string): Promise<boolean> {
        var alias = slug(name, { lower: true })
        var count: number = await this.menuCategoryRepository.count({ where: { alias } })
        return count == 0
    }

    private async checkIsAliasFreeExcept(name: string, id: number): Promise<boolean> {
        var alias = slug(name, { lower: true })
        var count: number = await this.menuCategoryRepository.count({ where: { alias, id: Not(id) } })
        return count == 0
    }


    async updateOrder(elements: any[]): Promise<boolean> {
        await map(elements, async (el, i) => {
            await this.menuCategoryRepository.update(el.id, { ordering: i })
        })
        return true
    }

    async updateElementsOrder(elements: any[]) {
        await map(elements, async (el, i) => {
            await this.menuElementRepository.update(el.id, { ordering: i })
        })
        return true
    }

    async addElementToMenu(element: any, cid: number) {
        var mc: MenuCategory = await this.menuCategoryRepository.findOne(cid)
        var el: MenuElement = await this.menuElementRepository.findOne(element.id)
        var last: MenuElement = await this.menuElementRepository.findOne({ where: { menuCategory: { id: cid } }, order: { ordering: 'DESC' } })
        var ordering: number = 0
        if (last) {
            ordering = last.ordering + 1
        }
        el.ordering = ordering
        el.menuCategory = mc
        return await el.save()

    }

    async updateElementsOrderWithNew(elements: any[], id: number) {
        await map(elements, async (el, i) => {
            await this.menuElementRepository.update(el.id, {
                ordering: i, menuCategory: {
                    id: id
                }
            })
        })
        return true
    }


    async getFreeMenuElements(): Promise<MenuElement[]> {
        return this.menuElementRepository.find({ where: { menuCategory: { id: null } } })
    }

}
