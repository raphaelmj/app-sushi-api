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




}
