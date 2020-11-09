import { AggsBucketHistogram, AggsValue } from "./es-partials.interface";
import { IndexOrderResponseHits } from "./index-order-response-hits.interface";

export namespace EsDateTotal {

    export interface AggsHistogramRevenueBucket extends AggsBucketHistogram {
        totalPer: AggsValue<number>
    }

    export interface AggsRevenue {
        buckets: AggsHistogramRevenueBucket[]
    }

    export interface AggsList {
        revenue: AggsRevenue
    }

    export interface EsDateTotalIndexResponseBody {
        took: number
        timed_out: boolean
        _shards: {
            total: number,
            successful: number
            skipped: number
            failed: number
        }
        hits: IndexOrderResponseHits
        aggregations: AggsList
    }

    export interface EsDateTotalIndexResponse {
        body: EsDateTotalIndexResponseBody
    }

}
