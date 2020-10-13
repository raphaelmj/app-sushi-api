import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Site } from 'src/schemas/site.schema';
import { Model } from 'mongoose';
import { Anchor } from 'src/schemas/anchor.schema';
import { map } from 'p-iteration';

@Injectable()
export class SiteService {
  constructor(
    @InjectModel(Site.name) private siteModel: Model<Site>,
    @InjectModel(Anchor.name) private anchorModel: Model<Anchor>,
  ) {}

  async getAll() {
    const anchors: Anchor[] = await this.anchorModel.find().sort({ order: 1 });
    const data: any[] = [];

    await map(anchors, async (anch, i) => {
      const where: Array<{ id: number }> = [];
      const obj = await anch.toObject();
      await map(obj.sitesRange, async (id: number) => {
        await where.push({ id });
      });

      data[i] = await this.addPageWithElements(where, obj);
    });

    return data;
  }

  async addPageWithElements(
    where: Array<{ id: number }>,
    obj: Record<any, unknown>,
  ): Promise<any> {
    const pages: Site[] = await this.siteModel.find({
      $or: where,
    });

    obj['elements'] = [];
    let x = 0;
    await map(pages, async (page, i) => {
      // console.log(page.elements)
      const pObj = await page.toObject();
      await map(pObj.elements, async (el, j) => {
        obj['elements'][x] = el;
        x++;
      });
    });

    return obj;
  }

  async getOneName() {
    return await this.siteModel.find({
      // "elements.elementType": 'many_names',
      'elements.elementType': { $eq: 'many_names' },
    });
  }

  async getManyNames() {
    return await this.siteModel.find({
      // "elements.elementType": 'many_names',
      'elements.elementType': { $eq: 'one_name' },
    });
  }

  async getConfigPrice() {
    return await this.siteModel.find({
      // "elements.elementType": 'many_names',
      'elements.elementType': { $eq: 'config_price' },
    });
  }

  async getDesc() {
    return await this.siteModel.find({
      // "elements.elementType": 'many_names',
      'elements.elementType': { $eq: 'desc_elements' },
    });
  }

  async getAnchorSites(anchorId: number) {
    var site = await this.anchorModel.findOne({ id: anchorId });
    if (!site) return [];
    var query: {} = {};

    var orId: Array<{ id: number }> = [];
    site.sitesRange.map((s) => {
      orId.push({ id: s });
    });
    if (orId.length) query['$or'] = orId;
    else return [];

    var sites: Site[] = await this.siteModel.find(query).sort({ order: 1 });

    return this.refactorGroupElements(sites);
  }

  refactorGroupElements(sites: Site[]) {
    var elems: Array<any> = [];
    sites.forEach((s) => {
      var data = s.toObject();
      var array: any[] = data.elements;
      array.map((el) => {
        elems.push(el);
      });
    });
    return elems;
  }
}
