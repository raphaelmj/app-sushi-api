import { EsIndexElement } from 'src/interfaces/es/es-index-element.interface';
import { IndexElementsResponseHits } from './index-elements-response-hits.interface';

export interface IndexResponseElementsHits {
    _index: string,
    _type: string,
    _id: string,
    _score: number,
    _source: EsIndexElement
}


export interface IndexResponseBody {
    took: number
    timed_out: boolean
    _shards: {
        total: number,
        successful: number
        skipped: number
        failed: number
    }
    hits: IndexElementsResponseHits
}
export interface IndexElementsResponse {
    body: IndexResponseBody
}
