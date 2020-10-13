import { map } from 'p-iteration';
import { ReverseOptionsData } from './../../interfaces/reverse-options-data.interface';
import { ReverseOptions } from './../../entities/ReverseOptions';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReverseOptionsService {
    constructor(
        @InjectRepository(ReverseOptions)
        private readonly reverseOptionsRepository: Repository<ReverseOptions>
    ) {

    }


    async orderChange(options: ReverseOptionsData[]) {
        await map(options, async (op, i) => {
            var opt: ReverseOptions = await this.reverseOptionsRepository.findOne(op.id)
            opt.ordering = (i + 1)
            await opt.save()
        })
    }

}
