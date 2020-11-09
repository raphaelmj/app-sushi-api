import { MenuElementsService } from 'src/services/menu-elements/menu-elements.service';
import { CartCategory } from './../../entities/CartCategory';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuElement } from 'src/entities/MenuElement';
import { Controller, Post, Res, Body, Delete, Param, Get } from '@nestjs/common';
import { Repository } from 'typeorm';

@Controller('/api/menu-element')
export class MenuElementController {

    constructor(
        @InjectRepository(CartCategory)
        private readonly cartCategoryRepository: Repository<CartCategory>,
        @InjectRepository(MenuElement)
        private readonly menuElementRepository: Repository<MenuElement>,
        private readonly menuElementService: MenuElementsService
    ) { }

    @Get('/all')
    async getElements(@Res() res) {
        return res.json(await this.menuElementRepository.find())
    }

    @Post('update')
    async update(@Res() res, @Body() body) {
        return res.json(await this.menuElementRepository.update(body.id, body))
    }

    @Post('update/many')
    async updateMany(@Res() res, @Body() body) {
        console.log(body)
        return res.json(await this.menuElementService.updateMany(body))
    }


    @Post('free/from/menu-category')
    async freeFromMenu(@Res() res, @Body() body) {
        await this.menuElementRepository.update(body.id, { menuCategory: null })
        return res.json(await this.menuElementRepository.findOne(body.id))
    }

    @Post('create')
    async create(@Res() res, @Body() body) {
        var el: Record<any, unknown> = body.element
        var cartCategory: CartCategory = await this.cartCategoryRepository.findOne(body.cartCategory.id)
        var element: MenuElement = await this.menuElementRepository.create(el)
        element.cartCategory = cartCategory
        await element.save()
        return res.json(element)
    }

    @Delete('delete/:id')
    async delete(@Res() res, @Param() params) {
        return res.json(await this.menuElementRepository.delete({ id: params.id }))
    }

    @Post('change/field')
    async changeFieldValue(@Res() res, @Body() body) {
        var upD = {}
        upD[body.field] = (body.value)
        return res.json(await this.menuElementRepository.update(body.id, upD))
    }




}
