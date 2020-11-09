import { EsUpdateOrdersService } from './../es-services/es-update/es-update-orders.service';
import { EsUpdateService } from './../es-services/es-update/es-update.service';
import { Console, Command, createSpinner } from 'nestjs-console';
import { Injectable } from '@nestjs/common';

@Console()
export class EsCommandsService {

    constructor(
        private readonly esUpdateService: EsUpdateService,
        private readonly esUpdateOrdersService: EsUpdateOrdersService
    ) {

    }

    @Command({
        command: 'create-indexes',
    })
    async createIndexes() {
        const spin = createSpinner();
        spin.start('creating indexes');
        await this.esUpdateService.createIndex()
        await this.esUpdateOrdersService.createIndex()
        spin.succeed('created');
    }


    @Command({
        command: 'update-indexes',
    })
    async updateIndexes() {
        const spin = createSpinner();
        spin.start('updating index');
        await this.esUpdateService.updateIndexFromAll()
        await this.esUpdateOrdersService.updateIndexFromAll()
        spin.succeed('created');
    }


    @Command({
        command: 'create-elements-index',
    })
    async createElementsIndex() {

        const spin = createSpinner();
        spin.start('creating index');
        await this.esUpdateService.createIndex()
        spin.succeed('created');
    }


    @Command({
        command: 'update-elements-index',
    })
    async updateElementsIndex() {
        const spin = createSpinner();
        spin.start('updating index');
        await this.esUpdateService.updateIndexFromAll()
        spin.succeed('created');
    }

    @Command({
        command: 'create-orders-index',
    })
    async createOrdersIndex() {

        const spin = createSpinner();
        spin.start('creating index');
        await this.esUpdateOrdersService.createIndex()
        spin.succeed('created');
    }

    @Command({
        command: 'update-orders-index',
    })
    async updateOrdersIndex() {
        const spin = createSpinner();
        spin.start('updating index');
        await this.esUpdateOrdersService.updateIndexFromAll()
        spin.succeed('created');
    }

}
