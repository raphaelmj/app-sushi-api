import { HistogramCalendarInterval } from './es/es-partials.interface';

export namespace ElementsSales {

    export interface SerieNameResponseData {
        from: string | number
        to: string | number
    }

    export interface SerieResponseData {
        dataName: SerieNameResponseData
        name: string
        value: number
    }
    export interface HistogramResponseElement {
        name: string
        series: SerieResponseData[]
    }


}



export interface QPElementsSales {
    from: string
    to: string
    cI: HistogramCalendarInterval,
    cCIds?: string
}

