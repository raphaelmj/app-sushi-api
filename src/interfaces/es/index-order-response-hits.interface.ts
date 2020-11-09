import { EsOrderDataElement } from "./es-order-index-element.interface";
import { IndexResponseHits } from "./es-partials.interface";

export interface IndexOrderResponseHits {
    total: {
        value: number,
        relation: string
    }
    max_score: number
    hits: IndexResponseHits<EsOrderDataElement>[]
}
