import { CalculateService } from './../services/calculate/calculate.service';
import { AppConfig } from 'src/entities/AppConfig';
import { CartOrderRepository } from './../repositories/cart-order-repository';
import { StepOptionsListElement, PlusElement } from './../interfaces/cart-group.interface';
import { ElementConfigStepsPrice } from './../interfaces/menu-element.interface';
import { MenuElementType } from './../interfaces/site-element.interface';
import { CartOrderElement } from 'src/entities/CartOrderElement';
// import { CartOrderElement } from './../entities/CartOrderElement';
import { MenuElement } from 'src/entities/MenuElement';
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

@Console()
export class RefactorDataCommandService {

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
        private readonly cartOrderRepository: Repository<CartOrder>,
        private readonly calculateService: CalculateService
    ) {

    }


    @Command({
        command: 'change-many-names'
    })
    async changeManyNames(): Promise<void> {

        const spin = createSpinner();
        spin.start('change many names');

        await this.changeManyN()

        spin.succeed('changed')

    }


    async changeManyN() {
        var manyNames: MenuElement[] = await this.menuElementRepository.find({ elementType: "many_names" })
        await map(manyNames, async (el: MenuElement, i) => {
            var priceNames: Array<any> = el.priceNames
            await map(priceNames, async (p, j) => {
                priceNames[j]['price'] = [p['price']]
            })
            el.priceNames = priceNames
            await el.save()
        })
    }


    @Command({
        command: 'change-desc-sea'
    })
    async changeDesc(): Promise<void> {

        const spin = createSpinner();
        spin.start('change desc-sea');

        await this.changeDescIsSea()

        spin.succeed('changed')

    }


    async changeDescIsSea() {
        var dels: MenuElement[] = await this.menuElementRepository.find({ elementType: "desc_elements" })
        await map(dels, async (el: MenuElement, i) => {
            var ds: Array<any> = el.descElements
            await map(ds, async (p, j) => {
                ds[j]['isSea'] = (p.seaPrice != '') ? true : false
            })
            el.descElements = ds
            await el.save()
        })
    }


    @Command({
        command: 'set-grill-and-gluten'
    })
    async setGrillAndGluten(): Promise<void> {

        const spin = createSpinner();
        spin.start('change grill and gluten');

        await this.changeGrilAndGluten()

        spin.succeed('changed')

    }


    async changeGrilAndGluten() {
        var menuElements: MenuElement[] = await this.menuElementRepository.find({ relations: ["cartCategory"] })
        await map(menuElements, async (el: MenuElement, i) => {

            if (el.cartCategory.alias != 'napoje') {
                el.canGrill = true
            }

            el.hasGluten = true

            await el.save()

        })
    }


    @Command({
        command: 'set-config-step-if-empty'
    })
    async setSetStepConfigEmpty(): Promise<void> {

        const spin = createSpinner();
        spin.start('change grill and gluten');

        await this.setConfigPriceIfEmpty()

        spin.succeed('changed')

    }


    async setConfigPriceIfEmpty() {
        var menuElements: MenuElement[] = await this.menuElementRepository.find()
        await map(menuElements, async (el: MenuElement, i) => {

            if (!el.configStepsPrice) {
                el.configStepsPrice = []
                await el.save()
            }


        })
    }


    @Command({
        command: 'set-ind-config'
    })
    async setConfig() {
        const spin = createSpinner();
        spin.start('change grill and gluten');

        await this.setIndConfigForSteps()

        spin.succeed('changed')
    }

    async setIndConfigForSteps() {
        var cartElems: CartOrderElement[] = await this.cartOrderElementRepository.find()
        await map(cartElems, async (c) => {
            if (c.ind) {
                var ind = c.ind
                ind['configFirstIndex'] = null
                ind['configSecondIndex'] = null
                ind['configThirdIndex'] = null
                c.ind = ind
                await c.save()
            }
        })
    }


    @Command({
        command: 'set-ind-config-plus'
    })
    async setConfigPlus() {
        const spin = createSpinner();
        spin.start('change grill and gluten');

        await this.setIndConfigForStepsPlus()

        spin.succeed('changed')
    }

    async setIndConfigForStepsPlus() {
        var cartElems: CartOrderElement[] = await this.cartOrderElementRepository.find({ where: { plusElements: Not('[]') } })
        await map(cartElems, async (c) => {
            await map(c.plusElements, async (cp) => {
                if (cp['ind']) {
                    var ind = cp['ind']
                    ind['configFirstIndex'] = null
                    ind['configSecondIndex'] = null
                    ind['configThirdIndex'] = null
                    cp['ind'] = ind
                    c.plusElements = cp
                }
            })
            await c.save()
        })
    }


    @Command({
        command: 'set-menuelement-id'
    })
    async setMenuElId() {
        const spin = createSpinner();
        spin.start('change grill and gluten');

        await this.setElementId()

        spin.succeed('changed')
    }



    async setElementId() {
        var cartElems: CartOrderElement[] = await this.cartOrderElementRepository.find({ where: { menuElement: { id: IsNull() }, elementType: Not('special') } })
        await map(cartElems, async (ce, i) => {
            var me: MenuElement = await this.menuElementRepository.findOne(ce.ind['id'])
            ce.menuElement = me
            await ce.save()
        })
    }

    @Command({
        command: 'set-price-to-config-step-many'
    })
    async setPriceToCSM() {
        const spin = createSpinner();
        spin.start('change config step many');

        await this.changeCSM()

        spin.succeed('changed')
    }


    async changeCSM() {

        var cartElems: CartOrderElement[] = await this.cartOrderElementRepository.find({ where: { elementType: MenuElementType.configStepsPriceMany } })

        await map(cartElems, async (ce, i) => {
            var el: ElementConfigStepsPrice[] = ce.element['configStepsPrice']
            ce.stepOptionsList.map((s: StepOptionsListElement, i) => {
                ce.stepOptionsList[i].pricePerOne = Number(el[s.configFirstIndex].types[s.configSecondIndex].options[s.configThirdIndex].price)
            })
            await ce.save()
        })



    }


    @Command({
        command: 'set-price-to-config-step-many-plus'
    })
    async setPriceToCSMPlus() {
        const spin = createSpinner();
        spin.start('change config step many');

        await this.changeCSMPlus()

        spin.succeed('changed')
    }


    async changeCSMPlus() {

        var cartElems: CartOrderElement[] = await this.cartOrderElementRepository.find({ where: { plusElements: Not('[]') } })

        await map(cartElems, async (ce, i) => {
            var ples: PlusElement[] = <PlusElement[]>ce.plusElements
            await map(ples, async (pl, j) => {
                if (pl.elementType == MenuElementType.configStepsPriceMany) {

                    pl.stepOptionsList.map((s: StepOptionsListElement, i) => {

                    })
                }
                if (pl.qunatity > 1) {

                }
            })
        })


    }

    @Command({
        command: 'recount-price-config-step-many'
    })
    async recountPriceCSM() {
        const spin = createSpinner();
        spin.start('change config step many');

        await this.recountCSM()

        spin.succeed('changed')
    }


    async recountCSM() {

        var cartElems: CartOrderElement[] = await this.cartOrderElementRepository.find({ where: { elementType: MenuElementType.configStepsPriceMany } })

        await map(cartElems, async (ce, i) => {
            var price: number = 0
            ce.stepOptionsList.map((s: StepOptionsListElement, i) => {
                price += s.pricePerOne
            })
            ce.price = price
            ce.pricePerOne = price
            await ce.save()
        })

    }


    @Command({
        command: 'recount-total'
    })
    async recountOrdersTotal() {
        const spin = createSpinner();
        spin.start('change config step many');

        await this.recountTotal()

        spin.succeed('changed')
    }


    async recountTotal() {

        var cartElems: CartOrder[] = await this.cartOrderRepository.find({ relations: ['cartOrderElements'] })

        await map(cartElems, async (o, i) => {
            var total: number = 0
            o.cartOrderElements.map((oel, i) => {
                total += Number(oel.price)
            })
            o.total = total
            await o.save()
        })

    }


    @Command({
        command: 'bonus-prices-set'
    })
    async bonusSet() {
        const spin = createSpinner();
        spin.start('change bonus-price');

        await this.bonusPricesSet()

        spin.succeed('changed')
    }


    async bonusPricesSet() {

        var cartElems: CartOrder[] = await this.cartOrderRepository.find()
        var appConfig: AppConfig = await AppConfig.findOne()

        await map(cartElems, async (c, i) => {
            var bonus: number = appConfig.data.bonus
            if (c.currentBonusPrice > 0) {
                bonus = c.currentBonusPrice
            }

            if (c.bonusUsed) {
                if (bonus >= c.total) {
                    c.bonusTotal = 0
                } else {
                    c.bonusTotal = this.calculateService.minusElements(c.total, bonus)
                }
            } else {
                c.bonusTotal = c.total
            }
            c.currentBonusPrice = bonus
            await c.save()
        })

    }

    @Command({
        command: 'extra-price-one-set'
    })
    async setOneExtra() {
        const spin = createSpinner();
        spin.start('set one extra');

        await this.setOneExtraToOrder()

        spin.succeed('changed')
    }


    async setOneExtraToOrder() {
        var cartElems: CartOrder[] = await this.cartOrderRepository.find()
        var appConfig: AppConfig = await AppConfig.findOne()
        await map(cartElems, async (c, i) => {
            c.oneExtraPrice = appConfig.data.extraPrice
            await c.save()
        })
    }

}
