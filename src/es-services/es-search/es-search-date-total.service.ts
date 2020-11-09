import { HistogramQueryResponse } from './../../interfaces/histogram-query-response.interface';
import { WeekdaysPl } from './../../interfaces/es/es-index-element.interface';
import { QPRevenue } from './../../interfaces/date-total-histogram.interface';
import { HistogramCalendarInterval, AggsBucketHistogram } from './../../interfaces/es/es-partials.interface';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as esDateTotal from "../../interfaces/es/date-total-index-response.interface";
import * as dateTotal from "../../interfaces/date-total-histogram.interface";


@Injectable()
export class EsSearchDateTotalService {


    constructor(
        private readonly elasticsearchService: ElasticsearchService
    ) {

    }

    async search(
        params: QPRevenue
    ): Promise<HistogramQueryResponse<dateTotal.DateTotal.HistogramResponse, QPRevenue> | any> {
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
        var indexResponse: esDateTotal.EsDateTotal.EsDateTotalIndexResponse = await this.elasticsearchService.search({
            index: 'orders',
            body: {
                query: {
                    range: {
                        endAt: {
                            gte: fromDay.format('yy-MM-DD HH:mm:ss'),
                            lt: toDay.format('yy-MM-DD HH:mm:ss'),
                        }
                    }
                },
                aggs: {
                    "revenue": {
                        "date_histogram": {
                            "field": "endAt",
                            "calendar_interval": params.cI
                        },
                        "aggs": {
                            "totalPer": {
                                "sum": {
                                    "field": "bonusTotal"
                                }
                            }
                        }
                    }
                }
            }
        })
        // return indexResponse
        if (indexResponse.body.hits.total.value > 0) {
            var aggs: esDateTotal.EsDateTotal.AggsHistogramRevenueBucket[] = indexResponse.body.aggregations.revenue.buckets
            var series: dateTotal.DateTotal.SerieResponseData[] = this.prepareSeriesDataResponse(aggs, params.cI)

            // if (aggs.length > 1) {
            var firstDate: number = (aggs.length > 0) ? aggs[0].key : null
            var lastDate: number = (aggs.length > 0) ? aggs[aggs.length - 1].key : null
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
            return {
                qp: params,
                data: {
                    name: '',
                    series: []
                },

            }
        }

        return {
            qp: params,
            data: {
                name: '',
                series: series
            },

        }
    }


    prepareSeriesDataResponse(aggs: esDateTotal.EsDateTotal.AggsHistogramRevenueBucket[], cI: HistogramCalendarInterval): dateTotal.DateTotal.SerieResponseData[] {
        var series: dateTotal.DateTotal.SerieResponseData[] = []
        aggs.map((hb: esDateTotal.EsDateTotal.AggsHistogramRevenueBucket) => {

            switch (cI) {
                case HistogramCalendarInterval.day:
                    series.push({
                        value: hb.totalPer.value,
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
                        value: hb.totalPer.value,
                        name: moment.utc(hb.key).format('D.MM') + ' - ' + moment.utc(moment.utc(hb.key).add(6, 'days')).format('D.MM YY'),
                        dataName: {
                            from: hb.key,
                            to: moment.utc(hb.key).add(6, 'days').valueOf()
                        }
                    })
                    break;
                case HistogramCalendarInterval.month:
                    series.push({
                        value: hb.totalPer.value,
                        name: moment.utc(hb.key).format('MM.YY'),
                        dataName: {
                            from: hb.key,
                            to: moment.utc(hb.key).add(1, 'month').valueOf()
                        }
                    })
                    break;
                case HistogramCalendarInterval.quarter:
                    series.push({
                        value: hb.totalPer.value,
                        name: moment.utc(hb.key).format('MM.YY') + ' - ' + moment.utc(moment.utc(hb.key).add(2, 'month').valueOf()).format('MM.YY'),
                        dataName: {
                            from: hb.key,
                            to: moment.utc(hb.key).add(2, 'month').valueOf()
                        }
                    })
                    break;
                case HistogramCalendarInterval.year:
                    series.push({
                        value: hb.totalPer.value,
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

}
