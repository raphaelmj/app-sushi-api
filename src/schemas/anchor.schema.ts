import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Anchor extends Document {

    @Prop()
    id: number;

    @Prop()
    name: string;

    @Prop()
    alias: string

    @Prop()
    site: number

    @Prop()
    order: number

    @Prop()
    sitesRange: Array<number>

}

export const AnchorSchema = SchemaFactory.createForClass(Anchor);