import { map } from 'p-iteration';
import { DescOptionsData } from './../../interfaces/desc-options-data.interface';
import { DescOptions } from './../../entities/DescOptions';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DescOptionsService {
    constructor(
        @InjectRepository(DescOptions)
        private readonly descOptionsRepository: Repository<DescOptions>
    ) {

    }

    async orderChange(options: DescOptionsData[]) {
        await map(options, async (op, i) => {
            var opt: DescOptions = await this.descOptionsRepository.findOne(op.id)
            opt.ordering = (i + 1)
            await opt.save()
        })
    }
}
