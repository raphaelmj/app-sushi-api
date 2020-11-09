import { MenuCategory } from './../../entities/MenuCategory';
import { MenuCategoryService } from './../../services/menu-category/menu-category.service';
import { Controller, Get, Post, Res, Body, Delete, Param } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('/api/menu-category')
export class MenuCategoryController {

    constructor(
        private readonly menuCategoryService: MenuCategoryService,
        @InjectRepository(MenuCategory)
        private readonly menuCategoryRepository: Repository<MenuCategory>
    ) { }

    @Get(':id')
    async getOne(@Res() res, @Param() params) {
        return res.json(await this.menuCategoryRepository.findOne({ where: { id: params.id }, relations: ['elements'] }))
    }

    @Get('all')
    async getAll(@Res() res) {
        return res.json(await this.menuCategoryRepository.find())
    }

    @Post('add')
    async add(@Res() res, @Body() body) {
        return res.json(await this.menuCategoryService.createNew(body))
    }

    @Post('update')
    async update(@Res() res, @Body() body) {
        return res.json(await this.menuCategoryService.update(body))
    }

    @Delete('delete/:id')
    async delete(@Res() res, @Param() params) {
        await this.menuCategoryService.delete(params.id)
        return res.json(params.id)
    }


    @Post('order/change')
    async changeOrder(@Res() res, @Body() body) {
        return res.json(await this.menuCategoryService.updateOrder(body))
    }

    @Post('update/many')
    async updateMany(@Res() res, @Body() body) {
        return res.json(await this.menuCategoryService.updateMany(body))
    }

    @Post('elements/order/change')
    async elementsOrderChange(@Res() res, @Body() body) {
        return res.json(await this.menuCategoryService.updateElementsOrder(body))
    }

    @Post('add/elements/order/change')
    async elementsOrderChangeAdd(@Res() res, @Body() body) {
        return res.json(await this.menuCategoryService.updateElementsOrderWithNew(body.elements, body.menuCategoryId))
    }

    @Post('add/element/to/menu')
    async addElementToMenu(@Res() res, @Body() body) {
        return res.json(await this.menuCategoryService.addElementToMenu(body.element, body.menuCategoryId))
    }


    @Get('get/free/elements')
    async getFreeMenuElements(@Res() res) {
        return res.json(await this.menuCategoryService.getFreeMenuElements())
    }


}
