import { EsUpdateService } from './../es-services/es-update/es-update.service';
import { Console, Command, createSpinner } from 'nestjs-console';
import { Injectable } from '@nestjs/common';

@Console()
export class EsCommandsService {

    constructor(
        private readonly esUpdateService: EsUpdateService
    ) {

    }

    @Command({
        command: 'create-index',
    })
    async createIndex() {

        const spin = createSpinner();
        spin.start('creating index');
        await this.esUpdateService.createIndex()
        spin.succeed('created');
    }


    @Command({
        command: 'update-index',
    })
    async updateIndex() {
        const spin = createSpinner();
        spin.start('updating index');
        await this.esUpdateService.updateIndexFromAll()
        spin.succeed('created');
    }



}
