import { BucketElement, BonusCartData, BonusPercent, TotalServeTypes, DayStats } from './../../interfaces/day-stats.interface';
import { EsSearchService } from './es-search.service';
import { EsOrderIndexElement, EsOrderDataElement } from './../../interfaces/es/es-order-index-element.interface';
import { map } from 'p-iteration';
import { EsPainlessScriptsService } from './../es-painless-scripts/es-painless-scripts.service';
import { MenuElement } from 'src/entities/MenuElement';
import { CartOrderElement } from 'src/entities/CartOrderElement';
import { CartOrder } from 'src/entities/CartOrder';
import { EsQueryOrdersBaseService } from './../es-update/es-query-orders-base.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import * as esOrder from "../../interfaces/es/order-index-response.interface";
import { AggsBucket } from 'src/interfaces/es/es-partials.interface';


@Injectable()
export class EsSearchOrderService {
    constructor(
        private readonly elasticsearchService: ElasticsearchService,
        private readonly esQueryBaseService: EsQueryOrdersBaseService,
        private readonly esSearchService: EsSearchService,
        private readonly esPainlessScriptsService: EsPainlessScriptsService,
        @InjectRepository(CartOrder)
        private readonly cartOrderRepository: Repository<CartOrder>,
        @InjectRepository(CartOrderElement)
        private readonly cartOrderElementRepository: Repository<CartOrderElement>,
        @InjectRepository(MenuElement)
        private readonly menuElementRepository: Repository<MenuElement>
    ) { }


    async dayStats(day: string): Promise<DayStats> {
        var queryDay = moment.parseZone(day);
        var endOfDay = moment.parseZone(day).add(1, 'd');
        var indexResponse: esOrder.EsOrder.EsOrderIndexResponse = await this.elasticsearchService.search({
            index: 'orders',
            body: {
                query: {
                    range: {
                        endAt: {
                            gte: queryDay.format('yy-MM-DD HH:mm:ss'),
                            lt: endOfDay.format('yy-MM-DD HH:mm:ss'),
                        }
                    }
                },
                aggs: {
                    "orderElements": {
                        "nested": {
                            "path": "elements"
                        },
                        "aggs": {
                            "groupElements": {
                                "terms": {
                                    "field": "elements.indString",
                                    "size": 30000
                                },
                                "aggs": {
                                    "packType": {
                                        "filter": { "term": { "elements.serveType": "pack" } }
                                    },
                                    "plateType": {
                                        "filter": { "term": { "elements.serveType": "plate" } }
                                    },
                                    "names": {
                                        "terms": {
                                            "field": "elements.name",
                                            "size": 30000
                                        }
                                    }
                                }
                            },
                            "totalPack": {
                                "filter": { "term": { "elements.serveType": "pack" } }
                            },
                            "totalPlate": {
                                "filter": { "term": { "elements.serveType": "plate" } }
                            }
                        }
                    },
                    "ordersTotal": {
                        "sum": {
                            "field": "total"
                        }
                    },
                    "ordersBonusTotal": {
                        "sum": {
                            "field": "bonusTotal"
                        }
                    },
                    "extraPrice": {
                        "sum": {
                            "script": {
                                "lang": "painless",
                                "source": this.esPainlessScriptsService.extraPriceSum()
                            }
                        }
                    },
                    "extra": {
                        "sum": {
                            "field": "extra"
                        }
                    },
                    "bonusPercent": {
                        "filter": { "term": { "bonusType": "percent" } },
                        "aggs": {
                            "percentBonusesTotal": {
                                "sum": {
                                    "script": {
                                        "lang": "painless",
                                        "source": this.esPainlessScriptsService.bonusPercentSum()
                                    }
                                }
                            },
                            "percentBonusList": {
                                "terms": {
                                    "field": "currentBonusPercent",
                                    "size": 30000
                                }
                            }
                        }
                    },
                    "bonusCart": {
                        "filter": { "term": { "bonusType": "cart" } },
                        "aggs": {
                            "cartBonusesTotal": {
                                "sum": {
                                    "script": {
                                        "lang": "painless",
                                        "source": this.esPainlessScriptsService.bonusCartSum()
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        var refactorPercentBucket = (bs: AggsBucket<number>[]): Array<{ count: number, percent: number }> => {
            var array: Array<{ count: number, percent: number }> = []
            bs.map(b => {
                array.push({
                    count: b.doc_count,
                    percent: b.key
                })
            })
            return array
        }

        var mergeBucketNames = (bs: AggsBucket<string>[]): string[] => {
            var a: string[] = []
            bs.map(b => {
                a.push(b.key)
            })
            return a
        }


        var bucketElements: BucketElement[] = []
        var aggs: esOrder.EsOrder.AggsOrderTypes = indexResponse.body.aggregations
        var buckets: esOrder.EsOrder.BucketServeTypes[] = aggs.orderElements.groupElements.buckets
        var bonusCart: BonusCartData = {
            ordersCount: aggs.bonusCart.doc_count,
            total: aggs.bonusCart.cartBonusesTotal.value
        }
        // var namesArray: Array<string[]> = []
        var bonusPercent: BonusPercent = {
            ordersCount: aggs.bonusPercent.doc_count,
            total: aggs.bonusPercent.percentBonusesTotal.value,
            details: refactorPercentBucket(aggs.bonusPercent.percentBonusList.buckets)
        }
        var totalServeTypes: TotalServeTypes = {
            pack: aggs.orderElements.totalPack.doc_count,
            plate: aggs.orderElements.totalPlate.doc_count
        }

        // await map(buckets, async (b, i) => {
        //     namesArray.push(await this.esSearchService.getElementsNamesFromIndStringRangeDate(b.key, queryDay.format('yy-MM-DD HH:mm:ss'), endOfDay.format('yy-MM-DD HH:mm:ss')))
        // })
        await map(buckets, async (b, i) => {
            bucketElements.push({
                names: mergeBucketNames(b.names.buckets),
                doc_count: b.doc_count,
                plate: b.plateType.doc_count,
                pack: b.packType.doc_count
            })
        })
        return {
            day,
            total: aggs.ordersTotal.value,
            totalCount: aggs.orderElements.doc_count,
            totalBonus: aggs.ordersBonusTotal.value,
            bonusCart,
            bonusPercent,
            totalServeTypes,
            bucketElements,
            extra: aggs.extra.value,
            extraPrice: aggs.extraPrice.value
        }
    }



}
