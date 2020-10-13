import { Injectable } from '@nestjs/common';
import { Anchor } from 'src/schemas/anchor.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AnchorService {
    constructor(@InjectModel(Anchor.name) private anchorModel: Model<Anchor>) { }

    async getAll() {
        return await this.anchorModel.find().sort({ order: 1 })
    }
}
