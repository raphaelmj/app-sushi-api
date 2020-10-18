import { UserService } from './../../services/user/user.service';
import { AppConfigData } from './../../interfaces/app-config.interface';
import { AppConfig } from 'src/entities/AppConfig';
import { CalculateService } from './../../services/calculate/calculate.service';
import { CartCategory } from './../../entities/CartCategory';
import { EsUpdateService } from './../../es-services/es-update/es-update.service';
import {
  Controller,
  Post,
  Res,
  Body,
  Get,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import { EventsGateway } from 'src/events.gateway';
import { CartOrderService } from 'src/services/cart-order/cart-order.service';
import { AuthService } from 'src/services/auth.service';
import { User } from 'src/entities/User';
import { OrdersService } from 'src/services/orders/orders.service';
import { query } from 'express';
import * as fs from 'fs';
import { join } from 'path';
import { CartOrder } from 'src/entities/CartOrder';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CartOrderElement } from 'src/entities/CartOrderElement';
import { OrderStatus } from 'src/interfaces/cart-order.interface';
import * as moment from 'moment';
import NtpTimeSync from "ntp-time-sync";

@Controller('/api/orders')
export class OrdersController {
  constructor(
    private readonly eventGateway: EventsGateway,
    private readonly cartOrderService: CartOrderService,
    private authService: AuthService,
    private userService: UserService,
    private ordersService: OrdersService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(CartOrder)
    private readonly cartOrderRepository: Repository<CartOrder>,
    @InjectRepository(CartOrderElement)
    private readonly cartOrderElementRepository: Repository<CartOrderElement>,
    private readonly esUpdateService: EsUpdateService,
    private readonly calculateService: CalculateService
  ) { }

  @Post('create')
  async create(@Res() res, @Body() body, @Query() query) {
    const user: User = await this.userRepository.findOne(body.userId)
    const timeSync = NtpTimeSync.getInstance();
    const appConfig: AppConfig = await AppConfig.findOne()
    const ac: AppConfigData = appConfig.data
    const cartOrder: CartOrder = await this.cartOrderService.create(body, user);


    try {
      var result = await timeSync.getTime()
      var date: Date = result.now
      var dateString: string = date.toLocaleString(ac.lang, { timeZone: ac.timezone })
      var nowDate = moment(dateString, 'YY-M-D HH:mm:ss')
      var endAtHourMinus = moment(endAt).add(-1, 'hour')
      var endAt = moment(cartOrder.endAt)
      if (endAtHourMinus.isAfter(nowDate)) {
        cartOrder.inProgress = true
        await cartOrder.save()
      }
    } catch (error) {
      console.log(error)
    }


    await this.esUpdateService.createIndexElementsFromOrder(cartOrder)
    this.eventGateway.server.emit('orderCreateFront', {
      order: cartOrder,
      uuid: query.uuid
    });
    return res.json(cartOrder);
  }

  @Get('app/all')
  async getAppOrders(@Res() res, @Query() query) {
    return res.json(await this.ordersService.getAppOrders(query));
  }

  @Get('order/:id')
  async getOrder(@Res() res, @Param() param) {
    const order = await this.cartOrderRepository.findOne(param.id, {
      relations: ['cartOrderElements'],
    });
    const group = await this.ordersService.refactorOrderElements(
      order.cartOrderElements,
    );
    return res.json({ order, group });
  }

  @Delete('delete/order/:id')
  async deleteOrder(@Res() res, @Param() param, @Query() query) {
    var order: CartOrder = await this.cartOrderRepository.findOne(param.id)
    await this.esUpdateService.removeElementNotReIndex(order)
    await this.cartOrderRepository.delete(param.id)
    this.eventGateway.server.emit('orderDelete', {
      uuid: query.uuid
    });
    return res.json(param)
  }

  @Post('day/quick/stats')
  async getQuickDayStats(@Res() res, @Body() body) {
    return res.json(await this.ordersService.getDayStats(body.date))
  }

  @Get('get/day/reservations')
  async getDayReservations(@Res() res, @Query() query) {
    return res.json(await this.ordersService.getDayOrders(query.day))
  }

  @Post('order/field/change')
  async fieldChange(@Res() res, @Body() body, @Query() query) {
    var corder: CartOrder = await this.cartOrderRepository.findOne(body.id)
    const partial: Record<any, unknown> = {};
    partial[body.field] = body.data;
    // if (body.field == 'inProgress' && body.data && corder.status == OrderStatus.ready) {
    //   partial['status'] = OrderStatus.create
    // }

    await this.cartOrderRepository.update({ id: body.id }, partial);

    if (body.field != 'paid' && body.field != 'inProgress') {
      this.eventGateway.server.emit('orderUpdate', {
        order: corder,
        uuid: query.uuid
      });
    } else {
      this.eventGateway.server.emit('orderQuietUpdate', {
        order: corder,
        uuid: query.uuid
      });
    }
    if (OrderStatus.ready == body.data && body.field == 'status') {
      await this.cartOrderService.setAllCartElementsAsReady(body.id)
      this.eventGateway.server.emit('orderReady', {
        order: corder,
        uuid: query.uuid
      });
    }

    var co: CartOrder = await this.cartOrderRepository.findOne(body.id)
    await this.esUpdateService.elementsDateUpdate(co)
    return res.json(body);
  }

  @Post('order/fields/change')
  async fieldsChange(@Res() res, @Body() body, @Query() query): Promise<CartOrder> {
    this.cartOrderRepository.update(body.id, body.data)
    var corder: CartOrder = await this.cartOrderRepository.findOne(body.id)
    await this.esUpdateService.elementsDateUpdate(corder)
    this.eventGateway.server.emit('orderUpdate', {
      order: corder,
      uuid: query.uuid
    });
    return res.json(corder);
  }

  @Post('order/date/change')
  async dateChange(@Res() res, @Body() body, @Query() query) {
    var corder: CartOrder = await this.ordersService.updateDateSetNumber(body)
    await this.esUpdateService.elementsDateUpdate(corder)
    this.eventGateway.server.emit('orderUpdateTime', {
      order: corder,
      uuid: query.uuid
    });
    return res.json(body);
  }

  @Post('order/status/change')
  async statusChange(@Res() res, @Body() body, @Query() query) {
    var corder: CartOrder = await this.cartOrderRepository.findOne(body.id)
    const partial: Record<any, unknown> = { status: body.status };
    if (corder.inProgress && OrderStatus.ready == body.status) {
      partial.inProgress = false
    }
    await this.cartOrderRepository.update(
      { id: body.id },
      partial,
    );
    this.eventGateway.server.emit('orderUpdateStatus', {
      order: corder,
      uuid: query.uuid
    });
    if (OrderStatus.ready == body.status) {
      await this.cartOrderService.setAllCartElementsAsReady(body.id)
      this.eventGateway.server.emit('orderReady', {
        order: corder,
        uuid: query.uuid
      });
    }
    return res.json(body);
  }

  @Post('order/bonus/change')
  async bonusChange(@Res() res, @Body() body, @Query() query) {
    var corder: CartOrder = await this.cartOrderRepository.findOne(body.id)
    var beforePaid: boolean = corder.paid
    corder = await this.cartOrderService.orderBonusSet(corder, body.bonusUsed)
    await this.esUpdateService.elementsDateUpdate(corder)
    this.eventGateway.server.emit('bonusUsed', {
      order: corder,
      uuid: query.uuid
    });
    if (!beforePaid && corder.paid) {
      this.eventGateway.server.emit('orderUpdate', {
        order: corder,
        uuid: query.uuid
      });
    }
    return res.json(corder);
  }

  @Post('order/element/update')
  async updateElement(@Res() res, @Body() body, @Query() query) {
    var corder: CartOrder = await this.cartOrderService.updateCartElement(body);
    await this.esUpdateService.elementDataUpdate(corder)
    this.eventGateway.server.emit('orderUpdate', {
      order: corder,
      uuid: query.uuid
    });
    return res.json(body);
  }

  @Post('order/element/delete')
  async deleteElement(@Res() res, @Body() body, @Query() query) {
    var corder: CartOrder = await this.cartOrderService.deleteElement(body.id, body.orderId);
    await this.esUpdateService.removeElement(corder)
    this.eventGateway.server.emit('orderUpdate', {
      order: corder,
      uuid: query.uuid
    });
    return res.json(body);
  }

  @Post('order/add/element')
  async addElement(@Res() res, @Body() body, @Query() query) {
    var { order, cartEl }: { order: CartOrder, cartEl: CartOrderElement } = await this.cartOrderService.addElement(body);
    await this.esUpdateService.addElementToOrder(order)
    this.eventGateway.server.emit('orderUpdate', {
      order: order,
      uuid: query.uuid
    });
    return res.json(cartEl);
  }

  @Post('order/element/status/change')
  async changeElementStatus(@Res() res, @Body() body, @Query() query) {
    await this.cartOrderElementRepository.update(
      { id: body.id },
      { status: body.status },
    );
    var ce: CartOrderElement = await this.cartOrderElementRepository.findOne({
      where: { id: body.id },
      relations: ['cartOrder'],
    });
    this.eventGateway.server.emit('orderUpdateElementStatus', {
      orderId: ce.cartOrder.id,
      elementId: body.id,
      status: body.status,
      uuid: query.uuid
    });
    return res.json(body);
  }
}
