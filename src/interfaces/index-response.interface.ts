import { ServeType } from './cart-order-element-data.interface';
import { EsIndexElement } from 'src/interfaces/es-index-element.interface';
export interface IndexResponseElementsHits {
    _index: string,
    _type: string,
    _id: string,
    _score: number,
    _source: EsIndexElement
}

export interface IndexResponseHits {
    total: {
        value: number,
        relation: string
    }
    max_score: number
    hits: IndexResponseElementsHits[]

}

export interface SumAggsValue {
    value: number
}

export interface AggsTypes {
    countElements?: DayElementsAggs
    priceTotal?: SumAggsValue
    priceExtra?: SumAggsValue
    bonusPriceTotal?: SumAggsValue
}


export interface Bucket {
    key: any
    doc_count: number
    ids?: IdsElementsAggs
    serveTypes?: ServeTypesElementsAggs
}

export interface BucketServeType {
    key: ServeType
    doc_count: number
}

export interface DayElementsAggs {
    doc_count_error_upper_bound: number
    sum_other_doc_count: number
    buckets: Bucket[]
}

export interface IdsElementsAggs {
    doc_count_error_upper_bound: number
    sum_other_doc_count: number
    buckets: Bucket[]
}

export interface ServeTypesElementsAggs {
    doc_count_error_upper_bound: number
    sum_other_doc_count: number
    buckets: BucketServeType[]
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
    hits: IndexResponseHits
    aggregations?: AggsTypes
}
export interface IndexResponse {
    body: IndexResponseBody
}
