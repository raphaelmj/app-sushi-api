export enum HistogramCalendarInterval {
    day = "day",
    week = "week",
    month = "month",
    quarter = "quarter",
    year = "year"
}

export interface AggsBucketsInfo {
    doc_count_error_upper_bound: number
    sum_other_doc_count: number
}

export interface AggsBucket<T> {
    key: T
    doc_count: number
}

export interface AggsBucketHistogram {
    key: number
    key_as_string: string
    doc_count: number
}

export interface AggsValue<T> {
    value: T
}

export interface DocCount {
    doc_count: number
}


export interface IndexResponseHits<T> {
    _index: string,
    _type: string,
    _id: string,
    _score: number,
    _source: T
}