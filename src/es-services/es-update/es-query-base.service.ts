import { CalculateService } from './../../services/calculate/calculate.service';
import { IdsElementsAggs } from './../../interfaces/index-response.interface';
import { ElementType } from './../../interfaces/site-element.interface';
import { AppConfig } from './../../entities/AppConfig';
import { ReverseElement, PlusElement, StepOptionsListElement } from './../../interfaces/cart-group.interface';
import { map } from 'p-iteration';
import { MenuElement } from './../../entities/MenuElement';
import { CartOrderElement } from './../../entities/CartOrderElement';
import { CartOrder } from 'src/entities/CartOrder';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EsIndexElement, EsElementPositionType, EsOptionsElement, EsDescElement, EsReverseElement, Weekdays } from 'src/interfaces/es-index-element.interface';
import * as moment from "moment"
import e = require('express');

@Injectable()
export class EsQueryBaseService {
    constructor(
        @InjectRepository(CartOrder)
        private readonly cartOrderRepository: Repository<CartOrder>,
        @InjectRepository(CartOrderElement)
        private readonly cartOrderElementRepository: Repository<CartOrderElement>,
        @InjectRepository(MenuElement)
        private readonly menuElementRepository: Repository<MenuElement>,
        private readonly calculateService: CalculateService
    ) {

    }

    async getCartElementsListForDay(day: string): Promise<EsIndexElement[]> {
        var queryDay = moment.parseZone(day);
        var endOfDay = moment.parseZone(day).add(1, 'd');
        var cOrders: CartOrder[] = await this.cartOrderRepository.find(
            {
                where: (qb) => {
                    qb.andWhere('endAt>=:d3', {
                        d3: queryDay.format('yy-MM-DD HH:mm:ss')
                    });
                    qb.andWhere('endAt<:d4', {
                        d4: endOfDay.format('yy-MM-DD HH:mm:ss')
                    });
                },
                relations: ['cartOrderElements', 'cartOrderElements.menuElement', 'cartOrderElements.menuElement.cartCategory'],
                order: { endAt: 'ASC' }
            }
        )
        return await this.elementsPrepare(cOrders)
    }

    async getCartElementsList(): Promise<EsIndexElement[]> {
        var cOrders: CartOrder[] = await this.cartOrderRepository.find(
            {
                relations: ['cartOrderElements', 'cartOrderElements.menuElement', 'cartOrderElements.menuElement.cartCategory'],
                order: { endAt: 'ASC' }
            }
        )
        return await this.elementsPrepare(cOrders)
    }



    async elementsPrepare(cOrders: CartOrder[]): Promise<EsIndexElement[]> {
        var elements: EsIndexElement[] = []
        await map(cOrders, async (o: CartOrder, i) => {
            var mergeIndex: string = String(i)
            await map(o.cartOrderElements, async (oe: CartOrderElement, j) => {
                mergeIndex += j
                let els: EsIndexElement[] = await this.createElementsFromElement(o, oe, mergeIndex)
                await map(els, async (el, i) => {
                    elements.push(el)
                })

            })
        })
        return elements
    }

    async getEsElementsFromOrder(o: CartOrder): Promise<EsIndexElement[]> {
        var elements: EsIndexElement[] = []
        await map(o.cartOrderElements, async (oe: CartOrderElement, j) => {
            let els: EsIndexElement[] = await this.createElementsFromElement(o, oe, String(j))
            await map(els, async (el, i) => {
                elements.push(el)
            })
        })
        return elements
    }

    async createElementsFromElement(o: CartOrder, oe: CartOrderElement, mergeIndex: string): Promise<EsIndexElement[]> {

        var elements: EsIndexElement[] = []
        if (oe.elementType == ElementType.configStepsPriceMany) {
            await map(oe.stepOptionsList, async (step: StepOptionsListElement, i) => {
                mergeIndex += i
                var esEl: EsIndexElement = await this.createElementToIndexFromSteps(o, oe, EsElementPositionType.normal, null, step, mergeIndex)
                elements.push(esEl)
            })
        } else {
            if (oe.quantity > 1) {
                await map(Array(oe.quantity).fill(1), async (v, i) => {
                    var esEl: EsIndexElement = await this.createElementToIndex(o, oe, EsElementPositionType.normal, null, mergeIndex)
                    elements.push(esEl)
                })
            } else {
                var esEl: EsIndexElement = await this.createElementToIndex(o, oe, EsElementPositionType.normal, null, mergeIndex)
                elements.push(esEl)
            }
        }


        if (oe.plusElements.length > 0) {

            await map(oe.plusElements, async (el: PlusElement, i) => {
                mergeIndex += i

                if (el.elementType == ElementType.configStepsPriceMany) {
                    await map(el.stepOptionsList, async (step: StepOptionsListElement, j) => {
                        mergeIndex += j
                        var parentEsEl: EsIndexElement = await this.createElementToIndexFromPlusSteps(o, el, oe, step, mergeIndex)
                        elements.push(parentEsEl)
                    })
                } else {
                    if (el.qunatity > 1) {
                        await map(Array(el.qunatity).fill(1), async (v, j) => {
                            mergeIndex += j
                            var parentEsEl: EsIndexElement = await this.createElementToIndexFromPlus(o, el, oe, mergeIndex)
                            elements.push(parentEsEl)
                        })
                    } else {
                        var parentEsEl: EsIndexElement = await this.createElementToIndexFromPlus(o, el, oe, mergeIndex)
                        elements.push(parentEsEl)
                    }

                }


            })
        }

        return elements
    }

    async createElementToIndex(
        o: CartOrder,
        oe: CartOrderElement,
        type: EsElementPositionType = EsElementPositionType.normal,
        poelId: number | null = null,
        mergeIndex: string): Promise<EsIndexElement> {
        var melId: number | null
        if (oe.elementType != 'special')
            var melId: number | null = (oe.menuElement) ? oe.menuElement.id : oe.ind['id']

        var indString = this.getIndString(
            (oe.elementType == 'special'),
            oe.isSea,
            melId,
            (oe.elementType != 'special') ? oe.ind['index'] : null,
            (oe.elementType != 'special') ? oe.ind['priceNameIndex'] : null,
            (oe.elementType != 'special') ? oe.ind['configFirstIndex'] : null,
            (oe.elementType != 'special') ? oe.ind['configSecondIndex'] : null,
            (oe.elementType != 'special') ? oe.ind['configThirdIndex'] : null)


        var fractionBonusPrice: number = this.calculateService.divElements(this.calculateService.divElements(o.currentBonusPrice, o.cartOrderElements.length), oe.quantity)

        return {
            id: o.id + '' + oe.id + '' + ((melId) ? melId : 0) + moment().format('x') + mergeIndex,
            oId: o.id,
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
            reservation: o.reservation,
            reservationSize: o.reservationSize,
            paid: o.paid,
            cCId: (oe.menuElement) ? oe.menuElement.cartCategory.id : null,
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
            extra: oe.extra,
            onOnePlate: oe.onOnePlate,
            priceExtra: (oe.extra > 0) ? await this.calcPriceExtra(oe.price, oe.pricePerOne, oe.extra, oe.quantity, oe.plusElements, false) : 0,
            pricePerOne: oe.pricePerOne,
            bonusUsed: o.bonusUsed,
            currentBonusPrice: o.currentBonusPrice,
            fractionBonusPrice: (o.bonusUsed) ? fractionBonusPrice : 0,
            // quantity: oe.quantity,
            serveType: oe.serveType,
            endAt: moment(o.endAt).format('YYYY-MM-DD HH:mm:ss'),
            startAt: moment(o.startAt).format('YYYY-MM-DD HH:mm:ss'),
            endDay: moment(o.endDay).format('YYYY-MM-DD'),
            weekDay: this.getWeekDay(o.endDay),
            hasPlus: (oe.plusElements.length > 0),
            element: (oe.element) ? JSON.stringify(oe.element) : null,
            description: oe.description,
            optionsElements: (oe.optionsElements) ? this.createOptionsElements(oe.optionsElements) : [],
            descElements: (oe.descElements) ? this.createDescElements(oe.descElements) : [],
            reverseElements: (oe.reverseElements) ? this.createReverseElements(oe.reverseElements) : [],
        }
    }

    async createElementToIndexFromSteps(
        o: CartOrder,
        oe: CartOrderElement,
        type: EsElementPositionType = EsElementPositionType.normal,
        poelId: number | null = null,
        step: StepOptionsListElement,
        mergeIndex: string
    ): Promise<EsIndexElement> {
        var melId: number | null
        if (oe.elementType != 'special')
            var melId: number | null = (oe.menuElement) ? oe.menuElement.id : oe.ind['id']

        var indString: string = this.getIndString(
            (oe.elementType == 'special'),
            oe.isSea,
            melId,
            (oe.elementType != 'special') ? oe.ind['index'] : null,
            (oe.elementType != 'special') ? oe.ind['priceNameIndex'] : null,
            (step) ? step.configFirstIndex : null,
            (step) ? step.configSecondIndex : null,
            (step) ? step.configThirdIndex : null)

        var fractionBonusPrice: number = this.calculateService.divElements(this.calculateService.divElements(o.currentBonusPrice, o.cartOrderElements.length), oe.stepOptionsList.length)


        return {
            id: o.id + '' + oe.id + '' + ((melId) ? melId : 0) + moment().format('x') + mergeIndex,
            oId: o.id,
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
            reservation: o.reservation,
            reservationSize: o.reservationSize,
            paid: o.paid,
            cCId: (oe.menuElement) ? oe.menuElement.cartCategory.id : null,
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
            extra: oe.extra,
            onOnePlate: oe.onOnePlate,
            priceExtra: (oe.extra > 0) ? await this.calcPriceExtra(oe.price, oe.pricePerOne, oe.extra, oe.quantity, oe.plusElements, true) : 0,
            pricePerOne: step.pricePerOne,
            bonusUsed: o.bonusUsed,
            currentBonusPrice: o.currentBonusPrice,
            fractionBonusPrice: (o.bonusUsed) ? fractionBonusPrice : 0,
            // quantity: oe.quantity,
            serveType: oe.serveType,
            endAt: moment(o.endAt).format('YYYY-MM-DD HH:mm:ss'),
            startAt: moment(o.startAt).format('YYYY-MM-DD HH:mm:ss'),
            endDay: moment(o.endDay).format('YYYY-MM-DD'),
            weekDay: this.getWeekDay(o.endDay),
            hasPlus: (oe.plusElements.length > 0),
            element: (oe.element) ? JSON.stringify(oe.element) : null,
            description: oe.description,
            optionsElements: (oe.optionsElements) ? this.createOptionsElements(oe.optionsElements) : [],
            descElements: (oe.descElements) ? this.createDescElements(oe.descElements) : [],
            reverseElements: (oe.reverseElements) ? this.createReverseElements(oe.reverseElements) : [],
        }
    }

    async createElementToIndexFromPlus(o: CartOrder, el: PlusElement, poel: CartOrderElement, mergeIndex): Promise<EsIndexElement> {
        var mel: MenuElement = await this.menuElementRepository.findOne({ where: { id: el.id }, relations: ['cartCategory'] })

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
            oId: o.id,
            oelId: null,
            poelId: poel.id,
            melId: (mel) ? mel.id : null,
            index: el.ind.index,
            priceNameIndex: (el.ind) ? el.ind['priceNameIndex'] : null,
            configFirstIndex: (el.ind) ? el.ind['priceNameIndex'] : null,
            configSecondIndex: (el.ind) ? el.ind['configSecondIndex'] : null,
            configThirdIndex: (el.ind) ? el.ind['configThirdIndex'] : null,
            indString,
            name: await this.decodeIndStringCreateName(indString),
            reservation: o.reservation,
            reservationSize: o.reservationSize,
            paid: o.paid,
            cCId: (mel.menuCategory) ? mel.menuCategory.id : null,
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
            extra: 0,
            onOnePlate: true,
            priceExtra: 0,
            pricePerOne: el.pricePerOne,
            bonusUsed: o.bonusUsed,
            currentBonusPrice: o.currentBonusPrice,
            fractionBonusPrice: 0,
            // quantity: 1,
            serveType: poel.serveType,
            endAt: moment(o.endAt).format('YYYY-MM-DD HH:mm:ss'),
            startAt: moment(o.startAt).format('YYYY-MM-DD HH:mm:ss'),
            endDay: moment(o.endDay).format('YYYY-MM-DD'),
            weekDay: this.getWeekDay(o.endDay),
            hasPlus: false,
            description: "",//poel.description,
            element: (mel) ? JSON.stringify(mel) : null,
            optionsElements: (el.optionsElements) ? this.createOptionsElements(el.optionsElements) : [],
            descElements: (el.descElements) ? this.createDescElements(el.descElements) : [],
            reverseElements: (el.reverseElements) ? this.createReverseElements(el.reverseElements) : [],
        }
    }


    async createElementToIndexFromPlusSteps(
        o: CartOrder,
        el: PlusElement,
        poel: CartOrderElement,
        step: StepOptionsListElement | null,
        mergeIndex: string): Promise<EsIndexElement> {
        var mel: MenuElement = await this.menuElementRepository.findOne({ where: { id: el.id }, relations: ['cartCategory'] })

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
            oId: o.id,
            oelId: null,
            poelId: poel.id,
            melId: (mel) ? mel.id : null,
            index: el.ind.index,
            priceNameIndex: (el.ind) ? el.ind['priceNameIndex'] : null,
            configFirstIndex: step.configFirstIndex,
            configSecondIndex: step.configSecondIndex,
            configThirdIndex: step.configThirdIndex,
            indString,
            name: await this.decodeIndStringCreateName(indString),
            reservation: o.reservation,
            reservationSize: o.reservationSize,
            paid: o.paid,
            cCId: (mel.menuCategory) ? mel.menuCategory.id : null,
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
            extra: 0,
            onOnePlate: true,
            priceExtra: 0,
            pricePerOne: step.pricePerOne,
            bonusUsed: o.bonusUsed,
            currentBonusPrice: o.currentBonusPrice,
            fractionBonusPrice: 0,
            // quantity: 1,
            serveType: poel.serveType,
            endAt: moment(o.endAt).format('YYYY-MM-DD HH:mm:ss'),
            startAt: moment(o.startAt).format('YYYY-MM-DD HH:mm:ss'),
            endDay: moment(o.endDay).format('YYYY-MM-DD'),
            weekDay: this.getWeekDay(o.endDay),
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

    async calcPriceExtra(
        price: number,
        pricePerOne: number,
        extra: number,
        quantity: number,
        plusElements: PlusElement[],
        isStep: boolean = false): Promise<number> {

        if (isStep) {
            if (plusElements.length == 0) {
                var priceDiv: number = this.calculateService.minusElements(price, pricePerOne)
                var extraPrice: number = this.calculateService.divElements(priceDiv, quantity)
                return extraPrice
            } else {

                let ps: Array<number | string> = []
                await map(plusElements, async (pel, i) => {
                    ps.push(pel.price)
                })
                var plusPrice: number = this.calculateService.pricePlusMapElements(0, ps)
                var priceForMenuProducts: number = this.calculateService.plusElements(plusPrice, pricePerOne)
                var priceDiv: number = this.calculateService.minusElements(price, priceForMenuProducts)
                var extraPrice: number = this.calculateService.divElements(priceDiv, quantity)
                return extraPrice
            }
        } else {
            if (plusElements.length == 0) {
                var extraPrice: number = (price - (pricePerOne * quantity)) / quantity
                return extraPrice
            } else {
                let ps: Array<number | string> = []
                await map(plusElements, async (pel, i) => {
                    ps.push(pel.price)
                })
                var plusPrice: number = this.calculateService.pricePlusMapElements(0, ps)
                var priceForMenuProducts: number = this.calculateService.plusElements(plusPrice, this.calculateService.multipleValues(pricePerOne, quantity))
                var priceDiv: number = this.calculateService.minusElements(price, priceForMenuProducts)
                var extraPrice: number = this.calculateService.divElements(priceDiv, quantity)
                return extraPrice
            }
        }


    }


    getWeekDay(endAt: Date): Weekdays {
        return moment(endAt).toDate().getDay()
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
                // name = me.shortName + '' + ((isSea) ? me.descElements[index].info + ' (krewetka)' : me.descElements[index].info)
                name = me.name + ((isSea) ? ' (krewetka)' : '')
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
