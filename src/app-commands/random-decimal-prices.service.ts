import { MenuElement } from './../entities/MenuElement';
import { CartOrderRepository } from './../repositories/cart-order-repository';
import { StepOptionsListElement, PlusElement } from './../interfaces/cart-group.interface';
import { ElementConfigStepsPrice } from './../interfaces/menu-element.interface';
import { ElementType, MenuElementType, ElementPrice, ElementPriceName, ElementDesc } from './../interfaces/site-element.interface';
import { CartOrderElement } from 'src/entities/CartOrderElement';
// import { CartOrderElement } from './../entities/CartOrderElement';
import { MenuCategory } from './../entities/MenuCategory';
import { InjectRepository } from '@nestjs/typeorm';
import { CartCategory } from 'src/entities/CartCategory';
import { Command, Console, createSpinner } from 'nestjs-console';
import { join } from 'path';
import * as fs from "fs"
import { map } from 'p-iteration';
import { Repository, Not, IsNull } from 'typeorm';
import e = require('express');
import { CartOrder } from 'src/entities/CartOrder';
import * as faker from 'faker/locale/pl'


@Console()
export class RandomDecimalPricesService {

    saveData: boolean = false

    constructor(
        @InjectRepository(CartCategory)
        private readonly cartCategoryRepository: Repository<CartCategory>,
        @InjectRepository(MenuCategory)
        private readonly menuCategoryRepository: Repository<MenuCategory>,
        @InjectRepository(MenuElement)
        private readonly menuElementRepository: Repository<MenuElement>,
        @InjectRepository(CartOrderElement)
        private readonly cartOrderElementRepository: Repository<CartOrderElement>,
        @InjectRepository(CartOrder)
        private readonly cartOrderRepository: Repository<CartOrder>
    ) {

    }


    @Command({
        command: 'random-decimal-price'
    })
    async randomDecimalPrices(): Promise<void> {

        const spin = createSpinner();
        spin.start('random decimal');

        await this.createRandomDecimal()

        spin.succeed('changed')

    }


    async createRandomDecimal() {

        var menuElements: MenuElement[] = await this.menuElementRepository.find()

        await map(menuElements, async (m: MenuElement, i) => {

            switch (m.elementType) {
                case MenuElementType.oneName:

                    await this.changePriceList(m)

                    break;
                case MenuElementType.manyNames:

                    await this.changeManyNamesPrices(m)

                    break;
                case MenuElementType.descElements:

                    await this.changeDescElementsPrices(m);

                    break;
                case MenuElementType.configPrice:

                    await this.changePriceList(m)

                    break;
                case MenuElementType.configStepsPrice:

                    await this.changeConfigStepsPrices(m)

                    break;

                case MenuElementType.configStepsPriceMany:

                    await this.changeConfigStepsPrices(m)

                    break;
            }

        })

    }

    async changePriceList(m: MenuElement) {
        var np: ElementPrice[] = []
        m.price.map((p: ElementPrice) => {
            p.price = p.price + '.' + faker.random.number(99)
            np.push(p)
        })
        m.price = np
        if (this.saveData) {
            await m.save()
        }

    }

    async changeManyNamesPrices(m: MenuElement) {
        var npn: ElementPriceName[] = []
        m.priceNames.map((p: ElementPriceName) => {
            var np: ElementPrice[] = []
            p.price.map((p: ElementPrice) => {
                p.price = p.price + '.' + faker.random.number(99)
                np.push(p)
            })
            p.price = np
            npn.push(p)
        })
        m.priceNames = npn
        if (this.saveData) {
            await m.save()
        }
    }

    async changeDescElementsPrices(m: MenuElement) {
        var dels: ElementDesc[] = []
        m.descElements.map((d: ElementDesc) => {
            if (d.isSea) {
                d.seaPrice = d.seaPrice + '.' + faker.random.number(99)
            }
            if (d.price != '') {
                d.price = d.price + '.' + faker.random.number(99)
            }
            dels.push(d)
        })
        m.descElements = dels
        if (this.saveData) {
            await m.save()
        }
    }

    async changeConfigStepsPrices(m: MenuElement) {
        var config: ElementConfigStepsPrice[] = []
        m.configStepsPrice.map((t: ElementConfigStepsPrice, i) => {
            var nc: ElementConfigStepsPrice = t
            t.types.map((o, j) => {
                o.options.map((c, k) => {
                    nc.types[j].options[k].price = c.price + '.' + faker.random.number(99)
                })
            })
            config.push(nc)
        })
        m.configStepsPrice = config
        if (this.saveData) {
            await m.save()
        }
    }


}
