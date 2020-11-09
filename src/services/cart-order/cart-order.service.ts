import { BonusType } from './../../interfaces/cart-order.interface';
import { CalculateService } from './../calculate/calculate.service';
import { CartOrderElement } from './../../entities/CartOrderElement';
import { async } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartOrder } from 'src/entities/CartOrder';
import { Repository } from 'typeorm';
import { User } from 'src/entities/User';
import { map } from 'p-iteration';
import { CartElementData } from 'src/interfaces/cart-group.interface';
import { action } from 'commander';
import { OrderActionType } from 'src/interfaces/cart-order.interface';
import * as fs from 'fs';
import { MenuElement } from 'src/entities/MenuElement';
import * as moment from "moment"
import { AppConfig } from 'src/entities/AppConfig';

@Injectable()
export class CartOrderService {
  constructor(
    @InjectRepository(CartOrder)
    private readonly cartOrderRepository: Repository<CartOrder>,
    @InjectRepository(CartOrderElement)
    private readonly cartOrderElementRepository: Repository<CartOrderElement>,
    @InjectRepository(MenuElement)
    private readonly menuElementRepository: Repository<MenuElement>,
    private readonly calculateService: CalculateService
  ) { }

  async create(
    data: {
      total: number;
      description: string | null;
      forWho: string | null;
      place: string | null;
      actionType: OrderActionType;
      reservation: boolean
      reservationSize: number;
      startAt: Date;
      endAt: Date | string;
      endDay: Date | string;
      cart: any[];
      bonusUsed: boolean;
      bonusType: BonusType,
      currentBonusPercent: number
    },
    user: User,
  ): Promise<CartOrder> {
    var appConfig: AppConfig = await AppConfig.findOne()
    data.endAt = moment(data.endAt).format('YYYY-MM-DD HH:mm:ss')
    data.endDay = moment(data.endAt).format('YYYY-MM-DD')
    data['currentBonusPrice'] = appConfig.data.bonus

    if (data.bonusUsed) {
      if (appConfig.data.bonus >= data.total) {
        data['bonusTotal'] = 0
      } else {
        data['bonusTotal'] = this.calcIfBonusUsedBeforeCreate(data.total, data.bonusType, appConfig.data.bonus, data.currentBonusPercent)
      }
    } else {
      data['bonusTotal'] = data.total
    }

    data['oneExtraPrice'] = appConfig.data.extraPrice
    const cartOrder: CartOrder = await this.cartOrderRepository.create(data);
    cartOrder.user = user;
    var lastForDay: CartOrder | null = await this.getLastOrderForDay(moment(data.endAt).toDate())
    if (lastForDay) {
      cartOrder.orderNumber = lastForDay.orderNumber + 1
    } else {
      cartOrder.orderNumber = 1
    }
    await cartOrder.save();
    await this.createCartElements(data.cart, cartOrder);
    return await this.cartOrderRepository.findOne(cartOrder.id, {
      relations: ['cartOrderElements'],
    });
  }

  async getLastOrderForDay(endAt: Date): Promise<CartOrder | null> {
    var d = moment(endAt).format('YYYY-MM-DD')
    return await this.cartOrderRepository.findOne({ where: { endDay: d }, order: { orderNumber: 'DESC' } })
  }

  async createCartElements(elements: any[], cartOrder: CartOrder) {
    // fs.writeFileSync(process.cwd() + "/data.json", JSON.stringify(elements))
    await map(elements, async (el: Record<any, unknown>) => {
      var coe: CartOrderElement = this.cartOrderElementRepository.create(el);
      // coe = await this.createCartElementAssoc(coe, el)
      coe.cartOrder = cartOrder;
      if (el.element) {
        coe.menuElement = await this.menuElementRepository.findOne(el.element['id'])
      }
      await coe.save();
    });
  }


  async createCartElementAssoc(c: CartOrderElement, el: {}): Promise<CartOrderElement> {
    var menuElements: MenuElement[] = []
    await map(el['plusElements'], async (pel) => {
      menuElements.push(await this.menuElementRepository.findOne({ id: pel['id'] }))
    })
    c.menuElements = menuElements
    return c
  }

  async updateCartElement(body: any): Promise<CartOrder> {
    await this.cartOrderElementRepository.update(body.element.id, body.element);
    await this.cartPriceUpdate(body.orderId);
    const el: CartOrderElement = await this.cartOrderElementRepository.findOne({
      where: { id: body.element.id },
      relations: ['cartOrder'],
    });
    return el.cartOrder;
  }

  async deleteElement(id: number, orderId: number): Promise<CartOrder> {
    await this.cartOrderElementRepository.delete(id);
    return await this.cartPriceUpdate(orderId);
  }

  async addElement(body: any): Promise<{ order: CartOrder, cartEl: CartOrderElement }> {
    const order: CartOrder = await this.cartOrderRepository.findOne(
      body.orderId,
      { relations: ['cartOrderElements'] }
    );
    const cartElement: Record<any, unknown> = body.element;
    cartElement['cartOrder'] = order;
    const cartEl: CartOrderElement = await this.cartOrderElementRepository
      .create(cartElement)

    if (cartElement.element)
      cartEl.menuElement = await this.menuElementRepository.findOne(cartElement.element['id'])

    await cartEl.save();
    await this.cartPriceUpdate(body.orderId);
    var no: CartOrder = await this.cartOrderRepository.findOne(
      body.orderId,
      { relations: ['cartOrderElements'] }
    );
    return { order: no, cartEl };
  }

  async cartPriceUpdate(id: number): Promise<CartOrder> {
    var order = await this.cartOrderRepository.findOne(id, {
      relations: ['cartOrderElements'],
    });
    var ps: Array<string | number> = []
    order.cartOrderElements.map((cel) => {
      ps.push(cel.price)
    });
    let total: number = this.calculateService.pricePlusMapElements(0, ps)
    let bonusTotal: number = total

    if (order.bonusUsed) {
      bonusTotal = this.calcIfBonusUsedBonusTotal(total, order.bonusType, order.currentBonusPercent, order)
    } else {
      bonusTotal = total
    }

    await this.cartOrderRepository.update(id, { total, bonusTotal });
    return await this.cartOrderRepository.findOne(id, {
      relations: ['cartOrderElements'],
    });
  }

  async crateCOR(cartOrd: Record<any, unknown>) {
    return await this.cartOrderElementRepository.create(cartOrd);
  }

  async setAllCartElementsAsReady(orderId: number) {
    return await this.cartOrderElementRepository.update({ cartOrder: { id: orderId } }, { status: true })
  }


  async orderBonusSet(o: CartOrder, bonusUsed: boolean): Promise<CartOrder> {
    // console.log(o.currentBonusPrice, o.total)
    if (bonusUsed) {
      if (this.calculateService.stringToNumber(o.currentBonusPrice) >= this.calculateService.stringToNumber(o.total)) {
        o.bonusTotal = 0
      } else {
        o.bonusTotal = this.calculateService.minusElements(o.total, o.currentBonusPrice)
      }
    } else {
      o.bonusTotal = o.total
    }
    if (o.bonusTotal == 0 && bonusUsed) {
      o.paid = true
    }
    o.bonusUsed = bonusUsed
    await o.save()
    return o
  }


  async orderBonusTypeSet(o: CartOrder, bonusUsed: boolean, bonusType: BonusType, percent: number) {

    if (bonusUsed) {

      // switch (bonusType) {
      //   case BonusType.none:
      //     o.currentBonusPercent = 0
      //     o.bonusTotal = o.total
      //     break;
      //   case BonusType.cart:
      //     if (this.calculateService.stringToNumber(o.currentBonusPrice) >= this.calculateService.stringToNumber(o.total)) {
      //       o.bonusTotal = o.total
      //     } else {
      //       o.bonusTotal = this.calculateService.minusElements(o.total, o.currentBonusPrice)
      //     }
      //     o.currentBonusPercent = 0
      //     break
      //   case BonusType.percent:
      //     percent = this.calculateService.stringToNumber(percent)
      //     if (percent == 0) {
      //       o.bonusTotal = o.total
      //     } else {
      //       var percentValue: number = this.calculateService.percentFind(percent, o.total)
      //       o.bonusTotal = this.calculateService.minusElements(o.total, percentValue)
      //     }
      //     o.currentBonusPercent = percent
      //     break;
      // }
      o = this.calcIfBonusUsed(o, bonusType, percent)

    } else {
      o.bonusTotal = o.total
      o.currentBonusPercent = 0
    }
    if (o.bonusTotal == 0 && bonusUsed) {
      o.paid = true
    }
    o.bonusUsed = bonusUsed
    o.bonusType = bonusType
    await o.save()
    return o
  }


  calcIfBonusUsed(o: CartOrder, bonusType: BonusType, percent: number): CartOrder {

    switch (bonusType) {
      case BonusType.none:
        o.currentBonusPercent = 0
        o.bonusTotal = o.total
        break;
      case BonusType.cart:
        if (this.calculateService.stringToNumber(o.currentBonusPrice) >= this.calculateService.stringToNumber(o.total)) {
          o.bonusTotal = 0
        } else {
          o.bonusTotal = this.calculateService.minusElements(o.total, o.currentBonusPrice)
        }
        o.currentBonusPercent = 0
        break
      case BonusType.percent:
        percent = this.calculateService.stringToNumber(percent)
        if (percent == 0) {
          o.bonusTotal = o.total
        } else {
          var percentValue: number = this.calculateService.percentFind(percent, o.total)
          o.bonusTotal = this.calculateService.minusElements(o.total, percentValue)
        }
        o.currentBonusPercent = percent
        break;
    }
    return o
  }

  calcIfBonusUsedBonusTotal(total: number, bonusType: BonusType, percent: number, o: CartOrder): number {

    var bonusTotal: number = this.calculateService.stringToNumber(total)

    switch (bonusType) {
      case BonusType.none:
        bonusTotal = total
        break;
      case BonusType.cart:
        if (this.calculateService.stringToNumber(o.currentBonusPrice) >= this.calculateService.stringToNumber(o.total)) {
          bonusTotal = 0
        } else {
          bonusTotal = this.calculateService.minusElements(total, o.currentBonusPrice)
        }
        break
      case BonusType.percent:
        percent = this.calculateService.stringToNumber(percent)
        if (percent == 0) {
          bonusTotal = total
        } else {
          var percentValue: number = this.calculateService.percentFind(percent, total)
          bonusTotal = this.calculateService.minusElements(total, percentValue)
        }
        break;
    }
    return bonusTotal
  }

  calcIfBonusUsedBeforeCreate(total: number, bonusType: BonusType, currentBonusPrice: number, percent: number): number {
    var bonusTotal: number = this.calculateService.stringToNumber(total)
    switch (bonusType) {
      case BonusType.none:

        break;
      case BonusType.cart:
        if (this.calculateService.stringToNumber(currentBonusPrice) >= this.calculateService.stringToNumber(total)) {
          bonusTotal = 0
        } else {
          bonusTotal = this.calculateService.minusElements(total, currentBonusPrice)
        }
        break
      case BonusType.percent:
        percent = this.calculateService.stringToNumber(percent)
        if (percent == 0) {
          bonusTotal = total
        } else {
          var percentValue: number = this.calculateService.percentFind(percent, total)
          bonusTotal = this.calculateService.minusElements(total, percentValue)
        }
        break;
    }
    return bonusTotal
  }

}
