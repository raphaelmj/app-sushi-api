import { OrderStatus } from './../interfaces/cart-order.interface';
import { QueryStringState } from './../interfaces/app-config.interface';
import { AppConfig } from './../entities/AppConfig';
import { Injectable } from '@nestjs/common';
import { createSpinner, Command, Console } from 'nestjs-console';

@Console()
export class ConfigService {

    @Command({
        command: 'create-config',
    })
    async createConfig(): Promise<void> {
        const spin = createSpinner();
        spin.start('creating config');
        await this.create()
        spin.succeed('created');
    }


    async create() {
        var data: Record<any, unknown> = {
            data: {
                extraPrice: 5,
                acc: [
                    'ginger',
                    'wasabi'
                ]
            }
        }
        await AppConfig.create(data).save()
    }


    @Command({
        command: 'config-add-bonus',
    })
    async configAddBonus(): Promise<void> {
        const spin = createSpinner();
        spin.start('add bonus');
        await this.addBonus()
        spin.succeed('add');
    }


    async addBonus() {
        var app = await AppConfig.findOne()
        app.data.bonus = 50
        await app.save()
    }


    @Command({
        command: 'config-timezone-lang',
    })
    async configTimeZone(): Promise<void> {
        const spin = createSpinner();
        spin.start('add bonus');
        var app = await AppConfig.findOne()
        app.data.timezone = "Europe/Warsaw"
        app.data.lang = 'pl-PL'
        await app.save()
        spin.succeed('add');
    }


    @Command({
        command: 'config-percent-list'
    })
    async setPercentList() {
        const spin = createSpinner();
        spin.start('percent list');
        var app = await AppConfig.findOne()
        app.data.bonusPercents = [
            5, 10, 15, 20
        ]
        await app.save()
        spin.succeed('changed')
    }


    @Command({
        command: 'config-inprogress'
    })
    async setInProgressTime() {
        const spin = createSpinner();
        spin.start('minutes inprogress');
        var app = await AppConfig.findOne()
        app.data.inProgressMinutes = 180;
        await app.save()
        spin.succeed('changed')
    }


    @Command({
        command: 'config-filters'
    })
    async setFilters() {
        const spin = createSpinner();
        spin.start('filters config');
        var app = await AppConfig.findOne()
        app.data.defaultFiltersStates = {
            waiter: {
                sts: [OrderStatus.create, OrderStatus.ready],
                paid: QueryStringState.none,
                reservation: QueryStringState.all,
                inprogress: QueryStringState.all
            },
            admin: {
                sts: [OrderStatus.create, OrderStatus.ready],
                paid: QueryStringState.none,
                reservation: QueryStringState.none,
                inprogress: QueryStringState.restrict
            }
        }
        await app.save()
        spin.succeed('changed')
    }

}
