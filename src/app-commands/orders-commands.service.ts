import { Command, Console, createSpinner } from 'nestjs-console';
import { map } from 'p-iteration';
import { InjectRepository } from '@nestjs/typeorm';
import { CartOrder } from 'src/entities/CartOrder';
import * as faker from 'faker/locale/pl';
import { Repository } from 'typeorm';
import { OrderStatus } from 'src/interfaces/cart-order.interface';
import { CartOrderElement } from 'src/entities/CartOrderElement';

@Console()
export class OrdersCommandService {

    constructor() {

    }

    @Command({
        command: 'orders-status'
    })
    async createUsers(): Promise<void> {

        const spin = createSpinner();
        spin.start('creating users');

        // await this.randomSts()

        spin.succeed('created')

    }




    async randomSts() {

        var sts: Array<OrderStatus> = [OrderStatus.create, OrderStatus.ready, OrderStatus.archive]

        var ords: CartOrder[] = await CartOrder.find()
        await map(ords, async (o, i) => {
            o.status = sts[faker.random.number((sts.length - 1))]
            await o.save()
        })

    }




}
