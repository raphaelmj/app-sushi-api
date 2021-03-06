import { EventsGateway } from 'src/events.gateway';
import { OrdersService } from 'src/services/orders/orders.service';
import { AppConfigData } from './../../interfaces/app-config.interface';
import { AppConfig } from 'src/entities/AppConfig';
import { CartOrder } from 'src/entities/CartOrder';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import NtpTimeSync from "ntp-time-sync";
import * as fs from 'fs';
import { join } from 'path';
import * as moment from "moment"

@Injectable()
export class ReservationTimeCheckService {
    constructor(
        private readonly ordersService: OrdersService,
        @InjectRepository(CartOrder)
        private readonly cartOrderRepository: Repository<CartOrder>,
        private readonly eventGateway: EventsGateway
    ) {

    }

    async checkReservations() {
        var appConfig: AppConfig = await AppConfig.findOne()
        var ac: AppConfigData = <AppConfigData>appConfig.data
        const timeSync = NtpTimeSync.getInstance();

        try {
            var result = await timeSync.getTime()
            var date: Date = result.now
            var dateString: string = date.toLocaleString(ac.lang, { timeZone: ac.timezone })
            // console.log(moment(date).format('YYYY-MM-DD HH:mm:ss'))

            // if (!fs.existsSync(join(process.cwd(), '/logs.txt'))) {
            //     fs.writeFileSync(join(process.cwd(), '/logs.txt'), '')
            // }
            // var b: Buffer = fs.readFileSync(join(process.cwd(), '/logs.txt'))
            // var logs: string = b.toString()
            // logs += dateString + '\r\n'
            // fs.writeFileSync(join(process.cwd(), '/logs.txt'), logs)
            // await this.logMake(dateString)


            var countChanged: number = await this.ordersService.changeIncommingReservations(dateString, date)
            // console.log(dateString)
            this.eventGateway.server.emit('changeInProgress', {
                isChanged: (countChanged > 0) ? true : false
            });
        } catch (error) {
            console.log(error)
        }


    }

    async logMake(dateString): Promise<string> {
        if (!fs.existsSync(join(process.cwd(), '/logs.txt'))) {
            fs.writeFileSync(join(process.cwd(), '/logs.txt'), '')
        }
        var b: Buffer = fs.readFileSync(join(process.cwd(), '/logs.txt'))
        var logs: string = b.toString()
        logs += dateString + '\r\n'
        fs.writeFileSync(join(process.cwd(), '/logs.txt'), logs)
        return dateString
    }

}
