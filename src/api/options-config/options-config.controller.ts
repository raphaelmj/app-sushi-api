import { ReverseOptionsData } from './../../interfaces/reverse-options-data.interface';
import { DescOptionsData } from './../../interfaces/desc-options-data.interface';
import { DescOptionsService } from './../../services/desc-options/desc-options.service';
import { ReverseOptionsService } from './../../services/reverse-options/reverse-options.service';
import { AppConfig } from './../../entities/AppConfig';
import { ReverseOptions } from './../../entities/ReverseOptions';
import { DescOptions } from './../../entities/DescOptions';
import { Controller, Get, Res, Post, Body, Delete, Param } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('api/options-config')
export class OptionsConfigController {
    constructor(
        @InjectRepository(DescOptions)
        private readonly descOptionsRepository: Repository<DescOptions>,
        @InjectRepository(ReverseOptions)
        private readonly reverseOptionsRepository: Repository<ReverseOptions>,
        private readonly reverseOptionsService: ReverseOptionsService,
        private readonly descOptionsService: DescOptionsService
    ) {

    }


    @Get('config/first')
    async getFirstConfig(@Res() res) {
        return res.json(await AppConfig.findOne())
    }

    @Post('config/update')
    async update(@Res() res, @Body() body) {
        return res.json(await AppConfig.update(body.id, body))
    }


    @Get('get/reverse')
    async getReverseOptions(@Res() res) {
        return res.json(await this.reverseOptionsRepository.find({ order: { ordering: 'ASC' } }))
    }

    @Get('get/desc')
    async getDescOptions(@Res() res) {
        return res.json(await this.descOptionsRepository.find({ order: { ordering: 'ASC' } }))
    }

    @Post('update/reverse/option')
    async updateDesc(@Res() res, @Body() body) {
        return res.json(await this.reverseOptionsRepository.update(body.id, body))
    }


    @Post('change/reverse/order')
    async updateReverseOrder(@Res() res, @Body() body) {
        await this.reverseOptionsService.orderChange(body)
        return res.json(body)
    }


    @Post('update/desc/option')
    async updateReverse(@Res() res, @Body() body) {
        return res.json(await this.descOptionsRepository.update(body.id, body))
    }

    @Post('change/desc/order')
    async updateDescOrder(@Res() res, @Body() body) {
        await this.descOptionsService.orderChange(body)
        return res.json(body)
    }

    @Post('create/desc/group')
    async crateDescGroup(@Res() res, @Body() body) {
        var lastDesc: DescOptions = await this.descOptionsRepository.findOne({ order: { ordering: 'DESC' } })
        var n: DescOptionsData = {
            name: body.name,
            tags: [],
            ordering: lastDesc.ordering + 1
        }
        return res.json(await this.descOptionsRepository.create(n).save())
    }

    @Delete('delete/desc/:id')
    async deleteDesc(@Res() res, @Param() params) {
        return res.json(await this.descOptionsRepository.delete(params.id))
    }

    @Post('create/reverse/group')
    async crateReverseGroup(@Res() res, @Body() body) {
        var lastReverse: ReverseOptions = await this.reverseOptionsRepository.findOne({ order: { ordering: 'DESC' } })
        var n: ReverseOptionsData = {
            name: body.name,
            tags: [],
            ordering: lastReverse.ordering + 1
        }
        return res.json(await this.reverseOptionsRepository.create(n).save())
    }

    @Delete('delete/reverse/:id')
    async deleteReverse(@Res() res, @Param() params) {
        return res.json(await this.reverseOptionsRepository.delete(params.id))
    }

}
