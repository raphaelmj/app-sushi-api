import { IndexResponseHits } from './es-partials.interface';
import { AggsBucket, AggsBucketsInfo, DocCount, AggsValue } from "./es-partials.interface";
import { EsOrderDataElement } from './es-order-index-element.interface';
import { IndexOrderResponseHits } from './index-order-response-hits.interface';

export namespace EsOrder {



    export interface SumBonusCart extends DocCount {
        cartBonusesTotal: AggsValue<number>
    }


    export interface AggsPercentBonus extends AggsBucketsInfo {
        buckets: AggsBucket<number>[]
    }

    export interface AggsPrecentBonus {
        percentBonusesTotal: AggsValue<number>
        percentBonusList: AggsPercentBonus
    }

    export interface SumBonusPrecent extends DocCount, AggsPrecentBonus {
    }

    export interface NamesAggs extends AggsBucketsInfo {
        buckets: AggsBucket<string>[]
    }

    export interface BucketServeTypes extends AggsBucket<string> {
        names: NamesAggs
        plateType: DocCount
        packType: DocCount
    }

    export interface AggsOrderElementsGroup extends AggsBucketsInfo {
        buckets: BucketServeTypes[]
    }

    export interface AggsTotalServeTypes extends AggsBucketsInfo {
        buckets: AggsBucket<string>[]
    }

    export interface AggsOrderElements extends DocCount {
        groupElements: AggsOrderElementsGroup
        totalPack: DocCount
        totalPlate: DocCount
    }

    export interface AggsOrderTypes {
        bonusCart: SumBonusCart
        ordersTotal: AggsValue<number>
        orderElements: AggsOrderElements
        ordersBonusTotal: AggsValue<number>
        bonusPercent: SumBonusPrecent
        extra: AggsValue<number>
        extraPrice: AggsValue<number>
    }

    export interface IndexOrderResponseBody {
        took: number
        timed_out: boolean
        _shards: {
            total: number,
            successful: number
            skipped: number
            failed: number
        }
        hits: IndexOrderResponseHits
        aggregations?: AggsOrderTypes
    }

    export interface EsOrderIndexResponse {
        body: IndexOrderResponseBody
    }

}