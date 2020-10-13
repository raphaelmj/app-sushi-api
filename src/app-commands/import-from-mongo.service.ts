import { MenuElement } from './../entities/MenuElement';
import { MenuCategory } from './../entities/MenuCategory';
import { CartCategory } from './../entities/CartCategory';
import { SiteElement } from './../interfaces/site-element.interface';
import { AnchorData } from './../interfaces/anchor-data.interface';
import { SiteService } from 'src/services/site/site.service';
import { Console, Command, createSpinner } from 'nestjs-console';
import { map } from 'p-iteration';

export interface AnchorList extends AnchorData {
  elements: SiteElement[];
}

@Console()
export class ImportFromMongoService {
  constructor(private readonly siteService: SiteService) { }

  @Command({
    command: 'import-menu',
  })
  async createUsers(): Promise<void> {
    const spin = createSpinner();
    spin.start('creating menu');
    await this.createMenuWithElements(await this.siteService.getAll());
    spin.succeed('created');
  }

  async createMenuWithElements(list: Array<unknown>): Promise<any> {
    return await map(list, async (anch: AnchorList, i) => {
      // console.log(anch.name);
      const n: unknown = { ...{ ordering: i }, ...anch };
      n['ordering'] = i;
      const cc: CartCategory = await CartCategory.create(n).save();
      const mc: MenuCategory = await MenuCategory.create(n).save();
      await this.createElementsFor(cc, mc, anch.elements);
    });
  }

  async createElementsFor(
    cc: CartCategory,
    mc: MenuCategory,
    elements: SiteElement[],
  ) {
    await map(elements, async (el, i) => {
      const nel: unknown = { ...{ ordering: i }, ...el };
      const nObj = MenuElement.create(nel);
      nObj.cartCategory = cc;
      nObj.menuCategory = mc;
      await nObj.save();
    });
  }
}
