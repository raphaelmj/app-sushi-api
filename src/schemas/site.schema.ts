import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Site extends Document {

    @Prop()
    id: number;

    @Prop()
    title: string;

    @Prop()
    order: number


    @Prop(raw({
        optionsOnInit: { enum: ["none", "select", "all"] },
        options: [{ type: String }],
        elastic: { type: Boolean },
        elementType: { enum: ["many_names", "one_name", "desc_elements", "config_price"] },
        hasNamePrefix: { type: Boolean },
        description: { type: String },
        name: { type: String },
        shortName: { type: String },
        perSizeForAll: { type: String },
        image: { type: String },
        priceNames: raw(
            {
                name: { type: String },
                shortName: { type: String },
                desc: { type: String },
                price: raw({
                    perSize: { type: String },
                    price: { type: String },
                    isSea: { type: Boolean }
                })
            }
        ),
        descElements: raw({
            info: { type: String },
            price: { type: String },
            seaPrice: { type: String }
        }),
        price: raw({
            perSize: { type: String },
            price: { type: String },
            isSea: { type: Boolean }
        })
    }))
    elements: Record<string, any>

}

export const SiteSchema = SchemaFactory.createForClass(Site);