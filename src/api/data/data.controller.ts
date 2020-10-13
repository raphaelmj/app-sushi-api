import { AppConfig } from 'src/entities/AppConfig';
import { async } from 'rxjs';
import { MenuElementsService } from 'src/services/menu-elements/menu-elements.service';
import { Controller, Get, Res, Param } from '@nestjs/common';
import { AnchorService } from 'src/services/anchor/anchor.service';
import { SiteService } from 'src/services/site/site.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DescOptions } from 'src/entities/DescOptions';
import { Repository } from 'typeorm';
import { ReverseOptions } from 'src/entities/ReverseOptions';

@Controller('/api/data')
export class DataController {
  constructor(
    private readonly siteService: SiteService,
    private readonly anchorService: AnchorService,
    @InjectRepository(DescOptions)
    private readonly descOptionsRepository: Repository<DescOptions>,
    @InjectRepository(ReverseOptions)
    private readonly reverseOptionsRepository: Repository<ReverseOptions>,
    private readonly menuElementsService: MenuElementsService,
  ) { }

  @Get('anchors')
  async getAnchors(@Res() res) {
    return res.json(await this.anchorService.getAll());
  }

  @Get('anchors/all')
  async getAnchs(@Res() res) {
    return res.json(await this.siteService.getAll());
  }

  @Get('anchor/:id/elements')
  async getAnchorElements(@Res() res, @Param() param) {
    return res.json(await this.siteService.getAnchorSites(param.id));
  }

  @Get('options')
  async getOptions(@Res() res) {
    const options: { desc: DescOptions[]; reverse: ReverseOptions[] } = {
      desc: [],
      reverse: [],
    };
    options.desc = await this.descOptionsRepository.find({
      order: { ordering: 'ASC' },
    });
    options.reverse = await this.reverseOptionsRepository.find({
      order: { ordering: 'ASC' },
    });
    return res.json(options);
  }

  @Get('menu/all')
  async getMenuAll(@Res() res) {
    return res.json(await this.menuElementsService.getMenuCategoryFullData());
  }

  @Get('cart/categories')
  async getCartCategories(@Res() res) {
    return res.json(await this.menuElementsService.getCartCategories());
  }

  @Get('app/config')
  async getConfig(@Res() res) {
    return res.json(await AppConfig.findOne());
  }

}
