import { query } from 'express';

import { CartCategory } from 'src/entities/CartCategory';
import { Injectable } from '@nestjs/common';
import { CartOrder } from 'src/entities/CartOrder';
import { CartOrderElement } from 'src/entities/CartOrderElement';
import {
  Repository,
  Not,
  getRepository,
  Brackets,
  FindConditions,
  Any,
  In,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  LessThan,
  SelectQueryBuilder,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CartOrderData,
  OrderStatus,
  OrderActionType,
} from 'src/interfaces/cart-order.interface';
import { Anchor } from 'src/schemas/anchor.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AnchorData } from 'src/interfaces/anchor-data.interface';
import {
  CartGroup,
  CartElementData,
} from 'src/interfaces/cart-group.interface';
// import { CartOrderElementData } from 'src/interfaces/cart-order-element-data.interface';
import { LIMIT, BASE_DATETIME_FORMAT } from 'src/constants';
import * as moment from "moment";
require("moment-precise-range-plugin");
import { map } from 'p-iteration';
import * as fs from 'fs';
import { join } from 'path';



@Injectable()
export class OrdersService {
  private anchors: Anchor[] = [];
  private carts: CartCategory[] = [];
  private group: CartGroup[] = [];
  private groupIndexes: {} = {};
  constructor(
    @InjectRepository(CartOrder)
    private readonly cartOrderRepository: Repository<CartOrder>,
    @InjectRepository(CartOrderElement)
    private readonly cartOrderElementRepository: Repository<CartOrderElement>,
    @InjectModel(Anchor.name) private anchorModel: Model<Anchor>,
    @InjectRepository(CartCategory)
    private readonly cartCategoryRepository: Repository<CartCategory>,
  ) { }

  async getAppOrders(query: {
    page: string;
    sts: string;
    day: string;
    paid: 'all' | '0' | '1' | 'none',
    reservation: '0' | '1' | 'all',
    inprogress: '0' | '1' | 'all',
  }): Promise<{
    orders: CartOrder[];
    total: number;
    qp: { page?: string; sts?: string };
    reservations?: number;
    archives?: number,
    inProgress?: number
  }> {
    // this.anchors = await this.anchorModel.find()
    // this.group = this.createCartGroupEmpty()
    var where: any = [];
    if (query.sts != '') where = this.prepareStatusWhere(query.sts);

    var skip: number = 0;
    if (query.page) {
      if (parseInt(query.page) > 1) {
        skip = (parseInt(query.page) - 1) * LIMIT;
      }
    }

    var reserv: 'all' | true | false = 'all'
    if (query.reservation) {
      if (query.reservation != 'all') {
        reserv = Boolean(Number(query.reservation))
      }
    }

    var paid: 'all' | true | false | 'none' = 'all'


    if (query.paid) {
      if (query.paid != 'all' && query.paid != 'none') {
        switch (query.paid) {
          case '0':
            paid = false
            break;
          case '1':
            paid = true
            break;
        }
      } else if (query.paid == 'none') {
        paid = 'none'
      }
    }

    var queryDay = moment.parseZone(query.day);
    var endOfDay = moment.parseZone(query.day).add(1, 'd');


    var data = await this.cartOrderRepository.findAndCount({
      relations: ['cartOrderElements'],
      where: (qb) => {


        if (query.inprogress == '1') {


          qb.where('CartOrder.inProgress=:pr1', { pr1: true })
            .andWhere(
              this.getDayQueryBrackets(queryDay, endOfDay)
            )

        } else if (query.reservation == '1') {

          qb.where('CartOrder.reservation=:r1', { r1: true })
            .andWhere(
              this.getDayQueryBrackets(queryDay, endOfDay)
            )

          // } else if (query.reservation != 'all') {


          //   qb.where(new Brackets((q) => {
          //     if (reserv == 'all') {
          //       q.where('CartOrder.reservation=:r1', { r1: true })
          //       q.orWhere('CartOrder.reservation=:r2', { r2: false })
          //     } else {
          //       q.where('CartOrder.reservation=:r', { r: reserv })
          //     }
          //   }))
          //     .andWhere(new Brackets((q) => {
          //       if (query.inprogress == '0') {
          //         q.where('CartOrder.inProgress=:pr1', { pr1: false })
          //       } else {
          //         q.where('CartOrder.inProgress=:pr1', { pr1: false })
          //         q.orWhere('CartOrder.inProgress=:pr1', { pr2: true })
          //       }
          //     }))
          //     .andWhere(
          //       this.getDayQueryBrackets(queryDay, endOfDay)
          //     )

        } else {

          qb.where(
            new Brackets((q) => {
              if (where.length == 0) {
                q.orWhere('CartOrder.status=:s', { s: null });
              } else {
                where.map((w, i) => {
                  var qO = {};
                  qO['s' + i] = w.status;
                  q.orWhere('CartOrder.status=:s' + i, qO);
                });
              }
            })

          )
            .andWhere(new Brackets((q) => {
              if (query.inprogress == '0') {
                q.where('CartOrder.inProgress=:pr1', { pr1: false })
              } else {
                q.where('CartOrder.inProgress=:pr1', { pr1: true })
                q.orWhere('CartOrder.inProgress=:pr2', { pr2: false })
              }
            }))
            .andWhere(new Brackets((q) => {
              if (paid == 'all') {
                q.where('CartOrder.paid=:p1', { p1: true })
                q.orWhere('CartOrder.paid=:p2', { p2: false })
              } else if (paid == 'none') {
                q.where('CartOrder.paid=:p1', { p1: true })
                q.andWhere('CartOrder.paid=:p2', { p2: false })
              } else {
                q.where('CartOrder.paid=:p', { p: paid })
              }
            }))
            .andWhere(new Brackets((q) => {
              if (reserv == 'all') {
                q.where('CartOrder.reservation=:r1', { r1: true })
                q.orWhere('CartOrder.reservation=:r2', { r2: false })
              } else {
                q.where('CartOrder.reservation=:r', { r: reserv })
              }
            }))
            .andWhere(
              this.getDayQueryBrackets(queryDay, endOfDay)
            )
        }
      },
      skip,
      take: LIMIT,
      order: { endAt: 'ASC' },
    });

    var reservations = await this.cartOrderRepository.count({
      where: (qb) => {
        qb.where('reservation=:r1',
          { r1: true }
        );
        qb.andWhere('endAt>=:d3', {
          d3: queryDay.format(BASE_DATETIME_FORMAT),
        });
        qb.andWhere('endAt<:d4', {
          d4: endOfDay.format(BASE_DATETIME_FORMAT),
        });
      }
    })
    var archives = await this.cartOrderRepository.count({
      where: (qb) => {
        qb.where('status=:s',
          { s: OrderStatus.archive }
        );
        qb.andWhere('endAt>=:d3', {
          d3: queryDay.format(BASE_DATETIME_FORMAT),
        });
        qb.andWhere('endAt<:d4', {
          d4: endOfDay.format(BASE_DATETIME_FORMAT),
        });
      }
    })
    var inProgress = await this.cartOrderRepository.count({
      where: (qb) => {
        qb.where('inProgress=:p1',
          { p1: true }
        );
        qb.andWhere('endAt>=:d3', {
          d3: queryDay.format(BASE_DATETIME_FORMAT),
        });
        qb.andWhere('endAt<:d4', {
          d4: endOfDay.format(BASE_DATETIME_FORMAT),
        });
      }
    })

    return { orders: data[0], total: data[1], qp: query, reservations, archives, inProgress };

  }

  getDayQueryBrackets(queryDay: moment.Moment, endOfDay: moment.Moment): Brackets {
    return new Brackets((q) => {
      q.where(
        new Brackets((q2) => {
          q2.where('endAt>=:d3', {
            d3: queryDay.format(BASE_DATETIME_FORMAT),
          });
          q2.andWhere('startAt<:d4', {
            d4: endOfDay.format(BASE_DATETIME_FORMAT),
          });
        }),
      );
      q.orWhere(
        new Brackets((q2) => {
          q2.where('endAt>=:d3', {
            d3: queryDay.format(BASE_DATETIME_FORMAT),
          });
          q2.andWhere('startAt<:d4', {
            d4: endOfDay.format(BASE_DATETIME_FORMAT),
          });
        }),
      );
      q.orWhere(new Brackets((q2) => {
        q2.where('endAt>=:d3', {
          d3: queryDay.format(BASE_DATETIME_FORMAT),
        });
        q2.andWhere('endAt<:d4', {
          d4: endOfDay.format(BASE_DATETIME_FORMAT),
        });
      }))
    })
  }

  prepareStatusWhere(sts: string): Array<{ status: string }> {
    var ss: string[] = sts.split('|');
    var where: Array<{ status: string }> = [];
    ss.map((s) => {
      where.push({ status: s });
    });
    return where;
  }

  refactorToGroups(cartOrders: CartOrder[]): CartOrderData[] {
    var data: CartOrderData[] = [];

    cartOrders.map((o, i) => {
      var emptyGroup: CartGroup[] = Object.assign([], this.group);
      var no: CartOrderData = {
        id: o.id,
        orderNumber: o.orderNumber,
        endDay: o.endDay,
        user: o.user,
        description: o.description,
        forWho: o.forWho,
        phone: o.phone,
        total: o.total,
        bonusTotal: o.bonusTotal,
        bonusUsed: o.bonusUsed,
        currentBonusPrice: o.currentBonusPrice,
        oneExtraPrice: o.oneExtraPrice,
        place: o.place,
        status: o.status,
        inProgress: o.inProgress,
        actionType: o.actionType,
        createType: o.createType,
        cartOrderElements: o.cartOrderElements,
        groupElements: this.createCartGroup(o.cartOrderElements, emptyGroup),
      };

      data.push(no);
    });

    return data;
  }

  private createCartGroup(
    elms: CartOrderElement[],
    emptyGroup: CartGroup[],
  ): CartGroup[] {
    elms.map((el) => {
      var i: number = this.groupIndexes[el.type['alias']];
      var r = <CartOrderElement>el;
      emptyGroup[i].elements.push(r);
    });

    return emptyGroup;
  }

  private createCartGroupEmpty(): CartGroup[] {
    var cartGroups: CartGroup[] = [];
    this.carts.map((anch, i) => {
      cartGroups.push({
        type: anch,
        elements: [],
      });
      this.groupIndexes[anch.alias] = i;
    });
    return cartGroups;
  }

  async refactorOrderElements(elms: CartOrderElement[]) {
    this.carts = await this.cartCategoryRepository.find({ order: { ordering: 'ASC' } })
    var emptyGroup: CartGroup[] = this.createCartGroupEmpty();
    return this.createCartGroup(elms, emptyGroup);
  }


  async updateDateSetNumber(data: { id: number, date: Date }): Promise<CartOrder> {
    var order: CartOrder = await this.cartOrderRepository.findOne(data.id)
    var orderDay: string = moment(order.endAt).format('YYYY-MM-DD')
    var bodyDay: string = moment(data.date).format('YYYY-MM-DD')
    var orderNumber: number = order.orderNumber
    var startAt = order.startAt
    if (orderDay != bodyDay) {
      var co: CartOrder = await this.cartOrderRepository.findOne({ where: { endDay: bodyDay }, order: { orderNumber: 'DESC' } })
      if (co) {
        orderNumber = co.orderNumber + 1
      }
      // if order AND later then START
      // if (moment(order.startAt).isAfter(moment(data.date))) {
      //   startAt = data.date
      // }
    }
    await this.cartOrderRepository.update(
      { id: data.id },
      { endAt: data.date, endDay: bodyDay, orderNumber, startAt },
    );
    return order
  }





  async getDayStats(date: Date):
    Promise<{
      all: { total: number | null, size: number },
      paid: { total: number | null, size: number },
      notPaid: { total: number | null, size: number },
      onSite: { total: number | null, size: number },
      takeAway: { total: number | null, size: number },
      onSiteNotPaid: { total: number | null, size: number },
      takeAwayNotPaid: { total: number | null, size: number }
    }> {

    var queryDay = moment.parseZone(moment(date).format('yy-MM-DD'));
    var endOfDay = moment.parseZone(moment(date).format('yy-MM-DD')).add(1, 'd');

    var { ordersAll, ordersPaid, ordersNotPaid, ordersOnSite, ordersTakeAway, ordersOnSiteNotPaid, ordersTakeAwayNotPaid } = this.getQuerySelectBuildersForStats(queryDay, endOfDay)

    var all: { total: number | null, size: number } = await ordersAll.select("SUM(orders.total) as total, COUNT(orders.id) as size").getRawOne()

    var paid: { total: number | null, size: number } = await ordersPaid.select("SUM(orders.total) as total, COUNT(orders.id) as size").getRawOne()

    var notPaid: { total: number | null, size: number } = await ordersNotPaid.select("SUM(orders.total) as total, COUNT(orders.id) as size").getRawOne()

    var onSite: { total: number | null, size: number } = await ordersOnSite.select("SUM(orders.total) as total, COUNT(orders.id) as size").getRawOne()

    var takeAway: { total: number | null, size: number } = await ordersTakeAway.select("SUM(orders.total) as total, COUNT(orders.id) as size").getRawOne()

    var onSiteNotPaid: { total: number | null, size: number } = await ordersOnSiteNotPaid.select("SUM(orders.total) as total, COUNT(orders.id) as size").getRawOne()

    var takeAwayNotPaid: { total: number | null, size: number } = await ordersTakeAwayNotPaid.select("SUM(orders.total) as total, COUNT(orders.id) as size").getRawOne()

    return { all, paid, notPaid, onSite, takeAway, onSiteNotPaid, takeAwayNotPaid }

  }

  getQuerySelectBuildersForStats(
    queryDay: moment.Moment,
    endOfDay: moment.Moment): {
      ordersAll: SelectQueryBuilder<CartOrder>,
      ordersPaid: SelectQueryBuilder<CartOrder>,
      ordersNotPaid: SelectQueryBuilder<CartOrder>,
      ordersOnSite: SelectQueryBuilder<CartOrder>,
      ordersTakeAway: SelectQueryBuilder<CartOrder>,
      ordersOnSiteNotPaid: SelectQueryBuilder<CartOrder>,
      ordersTakeAwayNotPaid: SelectQueryBuilder<CartOrder>
    } {

    var ordersAll = this.cartOrderRepository.createQueryBuilder('orders')
      .where(new Brackets((qb) => {
        qb.where(new Brackets((q) => {
          q.where(
            new Brackets((q2) => {
              q2.where('endAt>=:d3', {
                d3: queryDay.format(BASE_DATETIME_FORMAT),
              });
              q2.andWhere('endAt<:d4', {
                d4: endOfDay.format(BASE_DATETIME_FORMAT),
              });
            }),
          );
        }))

      }))

    var ordersPaid = this.cartOrderRepository.createQueryBuilder('orders')
      .where(new Brackets((qb) => {
        qb.where(new Brackets((q) => {
          q.where(
            new Brackets((q2) => {
              q2.where('endAt>=:d3', {
                d3: queryDay.format(BASE_DATETIME_FORMAT),
              });
              q2.andWhere('endAt<:d4', {
                d4: endOfDay.format(BASE_DATETIME_FORMAT),
              });
            }),
          );
        }))

      }))
      .andWhere('orders.paid=:p1', { p1: true })

    var ordersNotPaid = this.cartOrderRepository.createQueryBuilder('orders')
      .where(new Brackets((qb) => {
        qb.where(new Brackets((q) => {
          q.where(
            new Brackets((q2) => {
              q2.where('endAt>=:d3', {
                d3: queryDay.format(BASE_DATETIME_FORMAT),
              });
              q2.andWhere('endAt<:d4', {
                d4: endOfDay.format(BASE_DATETIME_FORMAT),
              });
            }),
          );
        }))

      }))
      .andWhere('orders.paid=:p1', { p1: false })

    var ordersOnSite = this.cartOrderRepository.createQueryBuilder('orders')
      .where(new Brackets((qb) => {
        qb.where(new Brackets((q) => {
          q.where(
            new Brackets((q2) => {
              q2.where('endAt>=:d3', {
                d3: queryDay.format(BASE_DATETIME_FORMAT),
              });
              q2.andWhere('endAt<:d4', {
                d4: endOfDay.format(BASE_DATETIME_FORMAT),
              });
            }),
          );
        }))

      }))
      .andWhere('orders.paid=:p1', { p1: true })
      .andWhere('orders.actionType=:a1', { a1: OrderActionType.onSite })

    var ordersTakeAway = this.cartOrderRepository.createQueryBuilder('orders')
      .where(new Brackets((qb) => {
        qb.where(new Brackets((q) => {
          q.where(
            new Brackets((q2) => {
              q2.where('endAt>=:d3', {
                d3: queryDay.format(BASE_DATETIME_FORMAT),
              });
              q2.andWhere('endAt<:d4', {
                d4: endOfDay.format(BASE_DATETIME_FORMAT),
              });
            }),
          );
        }))

      }))
      .andWhere('orders.paid=:p1', { p1: true })
      .andWhere(
        new Brackets((qb) => {
          qb
            .where('actionType=:a1', { a1: OrderActionType.takeAway })
            .orWhere('actionType=:a2', { a2: OrderActionType.delivery })
        })
      )

    var ordersOnSiteNotPaid = this.cartOrderRepository.createQueryBuilder('orders')
      .where(new Brackets((qb) => {
        qb.where(new Brackets((q) => {
          q.where(
            new Brackets((q2) => {
              q2.where('endAt>=:d3', {
                d3: queryDay.format(BASE_DATETIME_FORMAT),
              });
              q2.andWhere('endAt<:d4', {
                d4: endOfDay.format(BASE_DATETIME_FORMAT),
              });
            }),
          );
        }))

      }))
      .andWhere('orders.paid=:p1', { p1: false })
      .andWhere('orders.actionType=:a1', { a1: OrderActionType.onSite })

    var ordersTakeAwayNotPaid = this.cartOrderRepository.createQueryBuilder('orders')
      .where(new Brackets((qb) => {
        qb.where(new Brackets((q) => {
          q.where(
            new Brackets((q2) => {
              q2.where('endAt>=:d3', {
                d3: queryDay.format(BASE_DATETIME_FORMAT),
              });
              q2.andWhere('endAt<:d4', {
                d4: endOfDay.format(BASE_DATETIME_FORMAT),
              });
            }),
          );
        }))

      }))
      .andWhere('orders.paid=:p1', { p1: false })
      .andWhere(
        new Brackets((qb) => {
          qb
            .where('actionType=:a1', { a1: OrderActionType.takeAway })
            .orWhere('actionType=:a2', { a2: OrderActionType.delivery })
        })
      )

    return { ordersAll, ordersPaid, ordersNotPaid, ordersOnSite, ordersTakeAway, ordersOnSiteNotPaid, ordersTakeAwayNotPaid }
  }


  async getDayOrders(day: string): Promise<{ dayR: CartOrder[], soonR: CartOrder[], day }> {
    var queryDay = moment.parseZone(day);
    var endOfDay = moment.parseZone(day).add(1, 'd');
    var reservations = await this.cartOrderRepository.find({
      where: (qb) => {
        qb.where('reservation=:r1',
          { r1: true }
        );
        qb.andWhere('endAt>=:d3', {
          d3: queryDay.format(BASE_DATETIME_FORMAT),
        });
        qb.andWhere('endAt<:d4', {
          d4: endOfDay.format(BASE_DATETIME_FORMAT),
        });
      }
    })
    var nextDaysR = await this.cartOrderRepository.find({
      where: (qb) => {
        qb.where('reservation=:r1',
          { r1: true }
        );
        qb.andWhere('endAt>=:d3', {
          d3: endOfDay.format(BASE_DATETIME_FORMAT),
        });
      }
    })
    return { dayR: reservations, soonR: nextDaysR, day }
  }

  async changeIncommingReservations(dateString: string): Promise<number> {

    var countChanged: number = 0

    var nowDate = moment(dateString, 'YY-M-D HH:mm:ss')
    var nowDateHourBefore = moment(nowDate).add(-1, 'hour')

    if (nowDate.toDate().getDate() != nowDateHourBefore.toDate().getDate()) {
      var startOf = moment(nowDateHourBefore).hour(0).minutes(0).second(0)
      var endOf = moment(nowDate.hour(0).minutes(0).second(0)).add(1, 'd');
    } else {
      var startOf = moment(nowDate).hour(0).minutes(0).second(0)
      var endOf = moment(startOf).add(1, 'd');
    }

    // console.log(startOf.format(BASE_DATETIME_FORMAT), endOf.format(BASE_DATETIME_FORMAT))

    var reservations: CartOrder[] = await this.cartOrderRepository.find({
      where: (qb) => {
        // qb.where('reservation=:r1',
        //   { r1: true }
        // );
        qb.where({ status: Not(OrderStatus.ready) });
        qb.andWhere('inProgress=:p',
          { p: false }
        );
        qb.andWhere(new Brackets((qb2) => {
          qb2.where('endAt>=:d3', {
            d3: startOf.format(BASE_DATETIME_FORMAT),
          });
          qb2.andWhere('endAt<:d4', {
            d4: endOf.format(BASE_DATETIME_FORMAT),
          });
        }))
      }
    })

    var added: CartOrder[] = []

    await map(reservations, async (r, i) => {
      var endAt = moment(r.endAt)
      var endAtHourMinus = moment(endAt.toDate()).add(-1, 'hour')
      if (endAtHourMinus.isBefore(nowDate)) {
        r.inProgress = true
        await r.save()
        added.push(r)
        countChanged++
      }

    })


    if (!fs.existsSync(join(process.cwd(), '/logs.txt'))) {
      fs.writeFileSync(join(process.cwd(), '/logs.txt'), '')
    }
    var b: Buffer = fs.readFileSync(join(process.cwd(), '/logs.txt'))
    var logs: string = b.toString()
    added.map(a => {
      var s: string = dateString + '|' + a.id + '|' + a.orderNumber + '|endAt:' + a.endAt
      logs += s + '\r\n'
    })

    fs.writeFileSync(join(process.cwd(), '/logs.txt'), logs)


    return countChanged

  }

}
