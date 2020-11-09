import { CartCategoryRepository } from './../../repositories/cart-category-repository';
import { CartCategory } from './../../entities/CartCategory';
import { StepOptionsListElement } from './../../interfaces/cart-order-element-data.interface';
import { PlusElement, ReverseElement } from './../../interfaces/cart-group.interface';
import { ElementType } from './../../interfaces/site-element.interface';
import { Weekdays, EsElementPositionType, EsOptionsElement, EsDescElement, EsReverseElement } from 'src/interfaces/es/es-index-element.interface';
import { map } from 'p-iteration';
import { EsOrderIndexElement, EsOrderDataElement, EsOrderNestedElement } from './../../interfaces/es/es-order-index-element.interface';
import { CalculateService } from './../../services/calculate/calculate.service';
import { MenuElement } from 'src/entities/MenuElement';
import { CartOrderElement } from 'src/entities/CartOrderElement';
import { CartOrder } from 'src/entities/CartOrder';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from "moment"

@Injectable()
export class EsQueryOrdersBaseService {
    constructor(
        @InjectRepository(CartOrder)
        private readonly cartOrderRepository: Repository<CartOrder>,
        @InjectRepository(CartOrderElement)
        private readonly cartOrderElementRepository: Repository<CartOrderElement>,
        @InjectRepository(CartCategory)
        private readonly cartCategoryRepository: Repository<CartCategory>,
        @InjectRepository(MenuElement)
        private readonly menuElementRepository: Repository<MenuElement>,
        private readonly calculateService: CalculateService
    ) {

    }


    async getCartOrdersList(): Promise<EsOrderIndexElement[]> {
        var cOrders: CartOrder[] = await this.cartOrderRepository.find(
            {
                relations: ['cartOrderElements', 'cartOrderElements.menuElement', 'cartOrderElements.menuElement.cartCategory'],
                order: { endAt: 'ASC' }
            }
        )
        return await this.orderElementsPrepare(cOrders)
    }

    async orderElementsPrepare(cOrders: CartOrder[]): Promise<EsOrderIndexElement[]> {
        var elements: EsOrderIndexElement[] = []
        await map(cOrders, async (o: CartOrder, i) => {
            var orderData: EsOrderDataElement = {
                oId: o.id,
                bonusUsed: o.bonusUsed,
                currentBonusPrice: o.currentBonusPercent,
                currentBonusPercent: o.currentBonusPercent,
                bonusType: o.bonusType,
                oneExtraPrice: o.oneExtraPrice,
                endAt: moment(o.endAt).format('YYYY-MM-DD HH:mm:ss'),
                startAt: moment(o.startAt).format('YYYY-MM-DD HH:mm:ss'),
                endDay: moment(o.endDay).format('YYYY-MM-DD'),
                weekDay: this.getWeekDay(o.endDay),
                total: o.total,
                bonusTotal: o.bonusTotal,
                extra: this.sumOrderExtraQuantity(o.cartOrderElements),
                extraTotalPrice: this.sumOrderExtraPrice(o.cartOrderElements, o.oneExtraPrice)
            }
            var nelems: EsOrderNestedElement[] = await this.createElementsList(o);
            var el: EsOrderIndexElement = { ...orderData, ...{ elements: nelems } }
            elements.push(el)
        })
        return elements
    }

    async orderElementPrepare(o: CartOrder): Promise<EsOrderIndexElement> {
        var orderData: EsOrderDataElement = {
            oId: o.id,
            bonusUsed: o.bonusUsed,
            currentBonusPrice: o.currentBonusPercent,
            currentBonusPercent: o.currentBonusPercent,
            bonusType: o.bonusType,
            oneExtraPrice: o.oneExtraPrice,
            endAt: moment(o.endAt).format('YYYY-MM-DD HH:mm:ss'),
            startAt: moment(o.startAt).format('YYYY-MM-DD HH:mm:ss'),
            endDay: moment(o.endDay).format('YYYY-MM-DD'),
            weekDay: this.getWeekDay(o.endDay),
            total: o.total,
            bonusTotal: o.bonusTotal,
            extra: this.sumOrderExtraQuantity(o.cartOrderElements),
            extraTotalPrice: this.sumOrderExtraPrice(o.cartOrderElements, o.oneExtraPrice)
        }
        var nelems: EsOrderNestedElement[] = await this.createElementsList(o);
        var el: EsOrderIndexElement = { ...orderData, ...{ elements: nelems } }
        return el
    }


    async createElementsList(o: CartOrder): Promise<EsOrderNestedElement[]> {
        var elements: EsOrderNestedElement[] = []
        await map(o.cartOrderElements, async (oe: CartOrderElement, j) => {
            let els: EsOrderNestedElement[] = await this.createElementsFromElement(o, oe, String(j))
            await map(els, async (el, i) => {
                elements.push(el)
            })
        })
        return elements
    }

    async createElementsFromElement(o: CartOrder, oe: CartOrderElement, mergeIndex: string): Promise<EsOrderNestedElement[]> {

        var elements: EsOrderNestedElement[] = []
        if (oe.elementType == ElementType.configStepsPriceMany) {
            await map(oe.stepOptionsList, async (step: StepOptionsListElement, i) => {
                mergeIndex += i
                var esEl: EsOrderNestedElement = await this.createNestedElementToIndexFromSteps(o, oe, EsElementPositionType.normal, null, step, mergeIndex)
                elements.push(esEl)
            })
        } else {
            if (oe.quantity > 1) {
                await map(Array(oe.quantity).fill(1), async (v, i) => {
                    var esEl: EsOrderNestedElement = await this.createNestedElementToIndex(o, oe, EsElementPositionType.normal, null, mergeIndex)
                    elements.push(esEl)
                })
            } else {
                var esEl: EsOrderNestedElement = await this.createNestedElementToIndex(o, oe, EsElementPositionType.normal, null, mergeIndex)
                elements.push(esEl)
            }
        }


        if (oe.plusElements.length > 0) {

            await map(oe.plusElements, async (el: PlusElement, i) => {
                mergeIndex += String(i)

                if (el.elementType == ElementType.configStepsPriceMany) {
                    await map(el.stepOptionsList, async (step: StepOptionsListElement, j) => {
                        mergeIndex += j
                        var parentEsEl: EsOrderNestedElement = await this.createNestedElementToIndexFromPlusSteps(o, el, oe, step, mergeIndex)
                        elements.push(parentEsEl)
                    })
                } else {
                    if (el.qunatity > 1) {
                        await map(Array(el.qunatity).fill(1), async (v, j) => {
                            mergeIndex += j
                            var parentEsEl: EsOrderNestedElement = await this.createNestedElementToIndexFromPlus(o, el, oe, null, mergeIndex)
                            elements.push(parentEsEl)
                        })
                    } else {
                        var parentEsEl: EsOrderNestedElement = await this.createNestedElementToIndexFromPlus(o, el, oe, null, mergeIndex)
                        elements.push(parentEsEl)
                    }
                }


            })
        }

        return elements
    }


    async createNestedElementToIndex(
        o: CartOrder,
        oe: CartOrderElement,
        type: EsElementPositionType = EsElementPositionType.normal,
        poelId: number | null = null,
        mergeIndex: string
    ): Promise<EsOrderNestedElement> {
        var melId: number | null = null
        var cCId: number | null = null
        if (oe.elementType != 'special')
            var melId: number | null = (oe.menuElement) ? oe.menuElement.id : oe.ind['id']

        if (melId) {
            var mel: MenuElement = await this.menuElementRepository.findOne({ where: { id: melId }, relations: ['cartCategory'] })
            if (mel) {
                cCId = (mel.cartCategory) ? mel.cartCategory.id : null
            }
        }


        if (oe.elementType == 'special') {
            cCId = await this.getSpecialCartCategory()
        }

        var indString = this.getIndString(
            (oe.elementType == 'special'),
            oe.isSea,
            melId,
            (oe.elementType != 'special') ? oe.ind['index'] : null,
            (oe.elementType != 'special') ? oe.ind['priceNameIndex'] : null,
            (oe.elementType != 'special') ? oe.ind['configFirstIndex'] : null,
            (oe.elementType != 'special') ? oe.ind['configSecondIndex'] : null,
            (oe.elementType != 'special') ? oe.ind['configThirdIndex'] : null)


        return {
            id: o.id + '' + oe.id + '' + ((melId) ? melId : 0) + moment().format('x') + mergeIndex,
            oelId: oe.id,
            poelId,
            melId: (oe.elementType == 'special') ? null : melId,
            index: (oe.ind) ? oe.ind['index'] : null,
            priceNameIndex: (oe.ind) ? oe.ind['priceNameIndex'] : null,
            configFirstIndex: (oe.ind) ? oe.ind['configFirstIndex'] : null,
            configSecondIndex: (oe.ind) ? oe.ind['configSecondIndex'] : null,
            configThirdIndex: (oe.ind) ? oe.ind['configThirdIndex'] : null,
            indString,
            name: await this.decodeIndStringCreateName(indString),
            cCId: cCId,
            elementPositionType: type,
            elastic: oe.elastic,
            elementType: oe.elementType,
            isSea: oe.isSea,
            hasGluten: oe.hasGluten,
            canGrill: oe.canGrill,
            canPack: oe.canPack,
            canAcc: oe.canAcc,
            canOnePlate: oe.canOnePlate,
            canExtra: oe.canExtra,
            onlyGrill: oe.onlyGrill,
            onlyGluten: oe.onlyGluten,
            gluten: oe.gluten,
            grill: oe.grill,
            pricePerOne: oe.pricePerOne,
            quantity: 1,
            serveType: oe.serveType,
            hasPlus: (oe.plusElements.length > 0),
            element: (oe.element) ? JSON.stringify(oe.element) : null,
            description: oe.description,
            optionsElements: (oe.optionsElements) ? this.createOptionsElements(oe.optionsElements) : [],
            descElements: (oe.descElements) ? this.createDescElements(oe.descElements) : [],
            reverseElements: (oe.reverseElements) ? this.createReverseElements(oe.reverseElements) : []
        }
    }

    async createNestedElementToIndexFromSteps(
        o: CartOrder,
        oe: CartOrderElement,
        type: EsElementPositionType = EsElementPositionType.normal,
        poelId: number | null = null,
        step: StepOptionsListElement,
        mergeIndex: string
    ): Promise<EsOrderNestedElement> {

        var melId: number | null = null
        var cCId: number | null = null
        if (oe.elementType != 'special')
            var melId: number | null = (oe.menuElement) ? oe.menuElement.id : oe.ind['id']


        if (melId) {
            var mel: MenuElement = await this.menuElementRepository.findOne({ where: { id: melId }, relations: ['cartCategory'] })
            if (mel) {
                cCId = (mel.cartCategory) ? mel.cartCategory.id : null
            }
        }


        if (oe.elementType == 'special') {
            cCId = cCId = await this.getSpecialCartCategory()
        }

        var indString: string = this.getIndString(
            (oe.elementType == 'special'),
            oe.isSea,
            melId,
            (oe.elementType != 'special') ? oe.ind['index'] : null,
            (oe.elementType != 'special') ? oe.ind['priceNameIndex'] : null,
            (step) ? step.configFirstIndex : null,
            (step) ? step.configSecondIndex : null,
            (step) ? step.configThirdIndex : null)

        return {
            id: o.id + '' + oe.id + '' + ((melId) ? melId : 0) + moment().format('x') + mergeIndex,
            oelId: oe.id,
            poelId,
            melId: (oe.elementType == 'special') ? null : melId,
            index: (oe.ind) ? oe.ind['index'] : null,
            priceNameIndex: (oe.ind) ? oe.ind['priceNameIndex'] : null,
            configFirstIndex: step.configFirstIndex,
            configSecondIndex: step.configSecondIndex,
            configThirdIndex: step.configThirdIndex,
            indString,
            name: await this.decodeIndStringCreateName(indString),
            cCId: cCId,
            elementPositionType: type,
            elastic: oe.elastic,
            elementType: oe.elementType,
            isSea: oe.isSea,
            hasGluten: oe.hasGluten,
            canGrill: oe.canGrill,
            canPack: oe.canPack,
            canAcc: oe.canAcc,
            canOnePlate: oe.canOnePlate,
            canExtra: oe.canExtra,
            onlyGrill: oe.onlyGrill,
            onlyGluten: oe.onlyGluten,
            gluten: oe.gluten,
            grill: oe.grill,
            pricePerOne: oe.pricePerOne,
            quantity: 1,
            serveType: oe.serveType,
            hasPlus: (oe.plusElements.length > 0),
            element: (oe.element) ? JSON.stringify(oe.element) : null,
            description: oe.description,
            optionsElements: (oe.optionsElements) ? this.createOptionsElements(oe.optionsElements) : [],
            descElements: (oe.descElements) ? this.createDescElements(oe.descElements) : [],
            reverseElements: (oe.reverseElements) ? this.createReverseElements(oe.reverseElements) : []
        }
    }

    async createNestedElementToIndexFromPlus(
        o: CartOrder,
        el: PlusElement,
        poel: CartOrderElement,
        step: StepOptionsListElement | null,
        mergeIndex: string
    ): Promise<EsOrderNestedElement> {
        var cCId: number | null = null
        var mel: MenuElement = await this.menuElementRepository.findOne({ where: { id: el.id }, relations: ['cartCategory'] })

        if (mel) {
            cCId = (mel.cartCategory) ? mel.cartCategory.id : null
        }


        var indString = this.getIndString(
            (poel.elementType == 'special'),
            el.isSea,
            ((mel) ? mel.id : null),
            ((el.ind) ? el.ind['index'] : null),
            ((el.ind) ? el.ind['priceNameIndex'] : null),
            ((el.ind) ? el.ind['configFirstIndex'] : null),
            ((el.ind) ? el.ind['configSecondIndex'] : null),
            ((el.ind) ? el.ind['configThirdIndex'] : null))

        return {
            id: o.id + '' + poel.id + '' + ((mel) ? mel.id : 0) + moment().format('x') + mergeIndex,
            oelId: poel.id,
            poelId: poel.id,
            melId: (mel) ? mel.id : null,
            index: el.ind.index,
            priceNameIndex: (el.ind) ? el.ind['priceNameIndex'] : null,
            configFirstIndex: (el.ind) ? el.ind['priceNameIndex'] : null,
            configSecondIndex: (el.ind) ? el.ind['configSecondIndex'] : null,
            configThirdIndex: (el.ind) ? el.ind['configThirdIndex'] : null,
            indString,
            name: await this.decodeIndStringCreateName(indString),
            cCId: cCId,
            elementPositionType: EsElementPositionType.plus,
            elastic: mel.elastic,
            elementType: <ElementType>mel.elementType,
            isSea: el.isSea,
            hasGluten: mel.hasGluten,
            canGrill: mel.canGrill,
            canPack: mel.canPack,
            canAcc: mel.canAcc,
            canOnePlate: mel.canOnePlate,
            canExtra: mel.canExtra,
            onlyGrill: mel.onlyGrill,
            onlyGluten: mel.onlyGluten,
            gluten: el.gluten,
            grill: el.grill,
            pricePerOne: el.pricePerOne,
            quantity: 1,
            serveType: poel.serveType,
            hasPlus: false,
            description: "",//poel.description,
            element: (mel) ? JSON.stringify(mel) : null,
            optionsElements: (el.optionsElements) ? this.createOptionsElements(el.optionsElements) : [],
            descElements: (el.descElements) ? this.createDescElements(el.descElements) : [],
            reverseElements: (el.reverseElements) ? this.createReverseElements(el.reverseElements) : [],
        }
    }

    async createNestedElementToIndexFromPlusSteps(
        o: CartOrder,
        el: PlusElement,
        poel: CartOrderElement,
        step: StepOptionsListElement | null,
        mergeIndex: string
    ) {
        var cCId: number | null = null
        var mel: MenuElement = await this.menuElementRepository.findOne({ where: { id: el.id }, relations: ['cartCategory'] })

        if (mel) {
            cCId = (mel.cartCategory) ? mel.cartCategory.id : null
        }

        var indString = this.getIndString(
            (poel.elementType == 'special'),
            el.isSea,
            ((mel) ? mel.id : null),
            ((el.ind) ? el.ind['index'] : null),
            ((el.ind) ? el.ind['priceNameIndex'] : null),
            step.configFirstIndex,
            step.configSecondIndex,
            step.configThirdIndex)

        return {
            id: o.id + '' + poel.id + '' + ((mel) ? mel.id : 0) + moment().format('x') + mergeIndex,
            oelId: poel.id,
            poelId: poel.id,
            melId: (mel) ? mel.id : null,
            index: el.ind.index,
            priceNameIndex: (el.ind) ? el.ind['priceNameIndex'] : null,
            configFirstIndex: step.configFirstIndex,
            configSecondIndex: step.configSecondIndex,
            configThirdIndex: step.configThirdIndex,
            indString,
            name: await this.decodeIndStringCreateName(indString),
            cCId: cCId,
            elementPositionType: EsElementPositionType.plus,
            elastic: mel.elastic,
            elementType: <ElementType>mel.elementType,
            isSea: el.isSea,
            hasGluten: mel.hasGluten,
            canGrill: mel.canGrill,
            canPack: mel.canPack,
            canAcc: mel.canAcc,
            canOnePlate: mel.canOnePlate,
            canExtra: mel.canExtra,
            onlyGrill: mel.onlyGrill,
            onlyGluten: mel.onlyGluten,
            gluten: el.gluten,
            grill: el.grill,
            pricePerOne: step.pricePerOne,
            quantity: 1,
            serveType: poel.serveType,
            hasPlus: false,
            description: "",//poel.description,
            element: (mel) ? JSON.stringify(mel) : null,
            optionsElements: (el.optionsElements) ? this.createOptionsElements(el.optionsElements) : [],
            descElements: (el.descElements) ? this.createDescElements(el.descElements) : [],
            reverseElements: (el.reverseElements) ? this.createReverseElements(el.reverseElements) : [],
        }
    }

    createOptionsElements(opt: string[]): EsOptionsElement[] {
        var array: EsOptionsElement[] = []
        opt.map((o, i) => {
            var bool: boolean = false
            var index: number
            array.map((esop: EsOptionsElement, j) => {
                if (o == esop.name) {
                    index = j
                    bool = true
                }
            })
            if (bool) {
                array[index].howMany++
            } else {
                array.push({
                    name: o,
                    howMany: 1
                })
            }
        })
        return array
    }

    createDescElements(opt: string[]): EsDescElement[] {
        var array: EsDescElement[] = []
        opt.map((o, i) => {
            var bool: boolean = false
            var index: number
            array.map((esop: EsDescElement, j) => {
                if (o == esop.name) {
                    index = j
                    bool = true
                }
            })
            if (bool) {
                array[index].howMany++
            } else {
                array.push({
                    name: o,
                    howMany: 1
                })
            }
        })
        return array
    }

    createReverseElements(opt: ReverseElement[]): EsReverseElement[] {
        var array: EsReverseElement[] = []
        opt.map((o, i) => {
            var bool: boolean = false
            var index: number
            array.map((esop: EsReverseElement, j) => {
                if (o.from == esop.from && o.to == esop.to) {
                    index = j
                    bool = true
                }
            })
            if (bool) {
                array[index].howMany++
            } else {
                array.push({
                    from: o.from,
                    to: o.to,
                    howMany: 1
                })
            }
        })
        return array
    }


    getIndString(
        isSpecial: boolean,
        isSea: boolean,
        melId?: number,
        index?: number | null,
        priceNameIndex?: number | null,
        configFirstIndex?: number | null,
        configSecondIndex?: number | null,
        configThirdIndex?: number | null
    ): string {
        var ind: string = ''
        if (isSpecial)
            return '0'

        ind += melId + '|'
        ind += index + '|'
        ind += priceNameIndex + '|'
        ind += configFirstIndex + '|'
        ind += configSecondIndex + '|'
        ind += configThirdIndex + '|'
        ind += ((isSea) ? '1' : '0')
        return ind
    }

    sumOrderExtraQuantity(oe: CartOrderElement[]): number {
        var sum = 0
        var list: Array<number | string> = []
        oe.map((el: CartOrderElement) => {
            list.push(el.extra)
        })
        return this.calculateService.pricePlusMapElements(sum, list)
    }

    sumOrderExtraPrice(oe: CartOrderElement[], oneExtraPrice: number): number {
        var price = 0
        var list: Array<number | string> = []
        oe.map((el: CartOrderElement) => {
            var pricePerEl = this.calculateService.multipleValues(el.extra, oneExtraPrice)
            list.push(pricePerEl)
        })
        return this.calculateService.pricePlusMapElements(price, list)
    }

    getWeekDay(endAt: Date): Weekdays {
        return moment(endAt).toDate().getDay()
    }

    async getSpecialCartCategory(): Promise<number> {
        var c: CartCategory = await this.cartCategoryRepository.findOne({ isSpecial: true })
        return c.id
    }


    async decodeIndStringCreateName(indString: string): Promise<string> {
        var inds: string[] = indString.split('|');
        if (indString == '0')
            return 'Specjalny'

        var me: MenuElement = await this.menuElementRepository.findOne(Number(inds[0]))
        var name: string = ''
        var index: number = (inds[1] != 'null') ? Number(inds[1]) : null
        var priceNameIndex: number = (inds[2] != 'null') ? Number(inds[2]) : null
        var configFirstIndex: number = (inds[3] != 'null') ? Number(inds[3]) : null
        var configSecondIndex: number = (inds[4] != 'null') ? Number(inds[4]) : null
        var configThirdIndex: number = (inds[5] != 'null') ? Number(inds[5]) : null
        var isSea: boolean = Boolean(Number(inds[6]))


        switch (me.elementType) {
            case ElementType.oneName:
                name = me.name
                break;

            case ElementType.manyNames:

                name = me.priceNames[priceNameIndex].name
                break;
            case ElementType.descElements:
                name = me.shortName + ' ' + ((isSea) ? me.descElements[index].info + ' (krewetka)' : me.descElements[index].info)
                // name = me.name + ((isSea) ? ' (krewetka)' : '')
                break;
            case ElementType.configPrice:
                var p = me.price[index]
                name = me.name + ' (' + p.perSize + 'szt.) ' + ((p.isSea) ? 'krewetka' : '')
                break;

            case ElementType.configStepsPrice:

                if (!configFirstIndex) {
                    name = me.name
                } else {
                    name = me.configStepsPrice[configFirstIndex].shortName
                    if (configSecondIndex <= (me.configStepsPrice[configFirstIndex].types.length - 1)) {
                        name += '>>' + me.configStepsPrice[configFirstIndex].types[configSecondIndex].type
                        if (configThirdIndex <= (me.configStepsPrice[configFirstIndex].types[configSecondIndex].options.length - 1)) {
                            name += '>>' + me.configStepsPrice[configFirstIndex].types[configSecondIndex].options[configThirdIndex].shortName
                        }
                    }
                }

                break;
            case ElementType.configStepsPriceMany:
                name = me.configStepsPrice[configFirstIndex].shortName
                if (configSecondIndex <= (me.configStepsPrice[configFirstIndex].types.length - 1)) {
                    name += '>>' + me.configStepsPrice[configFirstIndex].types[configSecondIndex].type
                    if (configThirdIndex <= (me.configStepsPrice[configFirstIndex].types[configSecondIndex].options.length - 1)) {
                        name += '>>' + me.configStepsPrice[configFirstIndex].types[configSecondIndex].options[configThirdIndex].shortName
                    }
                }
                break;
        }

        return name
    }

}
