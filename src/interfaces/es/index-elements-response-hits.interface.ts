import { EsIndexElement } from './es-index-element.interface';
import { IndexResponseHits } from "./es-partials.interface";

export interface IndexElementsResponseHits {
    total: {
        value: number,
        relation: string
    }
    max_score: number
    hits: IndexResponseHits<EsIndexElement>[]
}
