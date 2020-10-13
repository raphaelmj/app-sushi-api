import { ReservationTimeCheckService } from './services/reservation-time-check/reservation-time-check.service';
import { CartOrder } from 'src/entities/CartOrder';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { SchedulerRegistry, Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class AppJobsService implements OnApplicationBootstrap {
    constructor(
        private schedule: SchedulerRegistry,
        private readonly reservationTimeCheckService: ReservationTimeCheckService
    ) { }

    async onApplicationBootstrap() {

    }

    @Cron('* * * * * *', {
        name: 'reservations',
    })
    async handleCron() {
        await this.reservationTimeCheckService.checkReservations()
    }

}
