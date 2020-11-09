import { HistogramQueryResponse } from './../../interfaces/histogram-query-response.interface';
import { AggsBucket } from 'src/interfaces/es/es-partials.interface';
import { WeekdaysPl } from './../../interfaces/es/es-index-element.interface';
import { HistogramCalendarInterval, AggsBucketHistogram } from './../../interfaces/es/es-partials.interface';
import { QPElementsSales } from './../../interfaces/elements-sales-histogram.interface';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as esElSales from "./../../interfaces/es/elements-sales-index-response.interface"
import * as elSales from "./../../interfaces/elements-sales-histogram.interface"

@Injectable()
export class EsSearchElementsSalesService {
    constructor(
        private readonly elasticsearchService: ElasticsearchService
    ) {

    }

    async search(params: QPElementsSales): Promise<HistogramQueryResponse<elSales.ElementsSales.HistogramResponseElement[], QPElementsSales>> {
        if (!params.cI) {
            params.cI = HistogramCalendarInterval.day
        } else {
            if (params.cI != HistogramCalendarInterval.day
                && params.cI != HistogramCalendarInterval.week
                && params.cI != HistogramCalendarInterval.month
                && params.cI != HistogramCalendarInterval.quarter
                && params.cI != HistogramCalendarInterval.year) {
                params.cI = HistogramCalendarInterval.day
            }
        }
        var fromDay = moment.parseZone(params.from);
        var toDay = moment.parseZone(params.to).add(1, 'day')
        let esQuery: Record<any, unknown> = {
            range: {
                endAt: {
                    gte: fromDay.format('yy-MM-DD HH:mm:ss'),
                    lt: toDay.format('yy-MM-DD HH:mm:ss'),
                }
            }
        }
        if (!params.cCIds) {
            params.cCIds = 'all'
        }
        if (params.cCIds) {
            if (params.cCIds != 'all' && params.cCIds != 'none') {
                var cs: string[] = params.cCIds.split(',')
                var csNum: number[] = cs.map(c => Number(c))
                if (csNum.length > 0) {
                    var should: any[] = csNum.map(c => {
                        return {
                            term: {
                                cCId: {
                                    value: c
                                }
                            }
                        }
                    })

                    esQuery = {
                        bool: {
                            must: [
                                {
                                    range: {
                                        endAt: {
                                            gte: fromDay.format('yy-MM-DD HH:mm:ss'),
                                            lt: toDay.format('yy-MM-DD HH:mm:ss'),
                                        }
                                    }
                                },
                                {
                                    bool: {
                                        should: should
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }


        if (params.cCIds != 'none') {

            var indexResponse: esElSales.EsElementsSales.EsElementsSalesIndexResponse = await this.elasticsearchService.search({
                index: 'oelements',
                body: {
                    query: esQuery,
                    "aggs": {
                        "elementsSales": {
                            "terms": {
                                "field": "indString",
                                "size": 30000
                            },
                            "aggs": {
                                "names": {
                                    "terms": {
                                        "field": "name",
                                        "size": 30000
                                    }
                                },
                                "sales": {
                                    "date_histogram": {
                                        "field": "endAt",
                                        "calendar_interval": params.cI
                                    }
                                }
                            }
                        }
                    }
                }
            })

            if (indexResponse.body.hits.total.value != 0) {
                var aggs: esElSales.EsElementsSales.AggsElementsSalesBucket[] = indexResponse.body.aggregations.elementsSales.buckets
                var elements: elSales.ElementsSales.HistogramResponseElement[] = this.prepareCollectionOfSeries(aggs, params.cI)

                var largestHistogram: esElSales.EsElementsSales.AggsSales = this.getMaxLengtAggsElement(aggs)
                var firstDate: number = (largestHistogram.buckets.length > 0) ? largestHistogram.buckets[0].key : null
                var lastDate: number = (largestHistogram.buckets.length > 0) ? largestHistogram.buckets[largestHistogram.buckets.length - 1].key : null
                var lastDateM: moment.Moment = moment.utc(lastDate)



                switch (params.cI) {
                    case HistogramCalendarInterval.day:
                        break;
                    case HistogramCalendarInterval.week:
                        if (lastDateM.weekday() != 0) {
                            var plus = (6 - lastDateM.weekday()) + 1
                            lastDate = lastDateM.add(plus, 'days').valueOf()
                        }
                        params.from = (firstDate) ? moment.utc(firstDate).format('yy-MM-DD') : params.from
                        params.to = (lastDate) ? moment.utc(lastDate).format('yy-MM-DD') : params.to
                        break;
                    case HistogramCalendarInterval.month:
                        var plus = lastDateM.daysInMonth() - 1
                        lastDate = lastDateM.add(plus, 'days').valueOf()
                        params.from = (firstDate) ? moment.utc(firstDate).format('yy-MM-DD') : params.from
                        params.to = (lastDate) ? moment.utc(lastDate).format('yy-MM-DD') : params.to
                        break;
                    case HistogramCalendarInterval.quarter:
                        lastDateM.add(2, 'months')
                        var plus = lastDateM.daysInMonth() - 1
                        lastDate = lastDateM.add(plus, 'days').valueOf()
                        params.from = (firstDate) ? moment.utc(firstDate).format('yy-MM-DD') : params.from
                        params.to = (lastDate) ? moment.utc(lastDate).format('yy-MM-DD') : params.to
                        break;
                    case HistogramCalendarInterval.year:
                        lastDate = lastDateM.endOf('year').valueOf()
                        params.from = (firstDate) ? moment.utc(firstDate).format('yy-MM-DD') : params.from
                        params.to = (lastDate) ? moment.utc(lastDate).format('yy-MM-DD') : params.to
                        break;
                }
            } else {
                return { data: [], qp: params }
            }

        } else {
            return { data: [], qp: params }
        }


        return { data: elements, qp: params }
    }

    prepareCollectionOfSeries(aggs: esElSales.EsElementsSales.AggsElementsSalesBucket[], cI: HistogramCalendarInterval): elSales.ElementsSales.HistogramResponseElement[] {
        var elements: elSales.ElementsSales.HistogramResponseElement[] = []
        aggs.map((hb: esElSales.EsElementsSales.AggsElementsSalesBucket) => {
            // console.log(hb.doc_count)
            elements.push({
                name: this.mergeNames(hb.names.buckets) + ' (' + hb.doc_count + ' szt.)',
                series: this.prepareSeriesDataResponse(hb.sales.buckets, cI)
            })
        })
        return elements
    }


    mergeNames(buckets: AggsBucket<string>[]): string {
        var name = ""
        buckets.map((b, i) => {
            name += b.key
            if (i != (buckets.length - 1) && buckets.length != 1) {
                name += ", "
            }
        })
        return name
    }

    prepareSeriesDataResponse(aggs: AggsBucketHistogram[], cI: HistogramCalendarInterval): any[] {
        var series: any[] = []
        aggs.map((hb: AggsBucketHistogram) => {

            switch (cI) {
                case HistogramCalendarInterval.day:
                    series.push({
                        value: hb.doc_count,
                        name: moment.utc(hb.key).format('D.MM.YY') + ' ' + WeekdaysPl[moment.utc(hb.key).weekday()],
                        dataName: {
                            from: hb.key,
                            to: moment.utc(hb.key).hours(23).minutes(59).seconds(59).valueOf()
                        }
                    })
                    break;
                case HistogramCalendarInterval.week:
                    // console.log(moment.utc(hb.key).format('YYYY-MM-DD HH:mm:ss'))
                    series.push({
                        value: hb.doc_count,
                        name: moment.utc(hb.key).format('D.MM') + ' - ' + moment.utc(moment.utc(hb.key).add(6, 'days')).format('D.MM YY'),
                        dataName: {
                            from: hb.key,
                            to: moment.utc(hb.key).add(6, 'days').valueOf()
                        }
                    })
                    break;
                case HistogramCalendarInterval.month:
                    series.push({
                        value: hb.doc_count,
                        name: moment.utc(hb.key).format('MM.YY'),
                        dataName: {
                            from: hb.key,
                            to: moment.utc(hb.key).add(1, 'month').valueOf()
                        }
                    })
                    break;
                case HistogramCalendarInterval.quarter:
                    series.push({
                        value: hb.doc_count,
                        name: moment.utc(hb.key).format('MM.YY') + ' - ' + moment.utc(moment.utc(hb.key).add(2, 'month').valueOf()).format('MM.YY'),
                        dataName: {
                            from: hb.key,
                            to: moment.utc(hb.key).add(2, 'month').valueOf()
                        }
                    })
                    break;
                case HistogramCalendarInterval.year:
                    series.push({
                        value: hb.doc_count,
                        name: moment.utc(hb.key).format('YYYY'),
                        dataName: {
                            from: hb.key,
                            to: moment.utc(hb.key).add(1, 'year').valueOf()
                        }
                    })
                    break;
            }
        })

        return series
    }


    getMaxLengtAggsElement(aggs: esElSales.EsElementsSales.AggsElementsSalesBucket[]): esElSales.EsElementsSales.AggsSales {
        var largestHistogram: esElSales.EsElementsSales.AggsSales
        var currentLength: number = 0
        aggs.map((a: esElSales.EsElementsSales.AggsElementsSalesBucket, i: number) => {
            if (a.sales.buckets.length > currentLength) {
                largestHistogram = a.sales
                currentLength = a.sales.buckets.length
            }
        })
        return largestHistogram
    }

}
