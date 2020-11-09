import { AggsBucket, AggsBucketHistogram, AggsBucketsInfo } from "./es-partials.interface";
import { IndexElementsResponseHits } from "./index-elements-response-hits.interface";

export namespace EsElementsSales {

    export interface AggsNames extends AggsBucketsInfo {
        buckets: AggsBucket<string>[]
    }

    export interface AggsSales {
        buckets: AggsBucketHistogram[]
    }

    export interface AggsElementsSalesBucket extends AggsBucket<string> {
        names: AggsNames
        sales: AggsSales
    }

    export interface AggsElementsSales extends AggsBucketsInfo {
        buckets: AggsElementsSalesBucket[]
    }

    export interface AggsList {
        elementsSales: AggsElementsSales
    }

    export interface EsElementsSalesIndexResponseBody {
        took: number
        timed_out: boolean
        _shards: {
            total: number,
            successful: number
            skipped: number
            failed: number
        }
        hits: IndexElementsResponseHits
        aggregations: AggsList
    }

    export interface EsElementsSalesIndexResponse {
        body: EsElementsSalesIndexResponseBody
    }

}
