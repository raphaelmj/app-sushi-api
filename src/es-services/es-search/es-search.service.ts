import { EsIndexElement } from './../../interfaces/es-index-element.interface';
import { EsQueryBaseService } from './../es-update/es-query-base.service';
import { MenuElement } from 'src/entities/MenuElement';
import { CartOrderElement } from 'src/entities/CartOrderElement';
import { map } from 'p-iteration';
import { IndexResponse, Bucket, IdsElementsAggs, ServeTypesElementsAggs } from './../../interfaces/index-response.interface';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { InjectRepository } from '@nestjs/typeorm';
import { CartOrder } from 'src/entities/CartOrder';
import { Repository } from 'typeorm';
import BigNumber from "bignumber.js"
import { ServeType } from 'src/interfaces/cart-order-element-data.interface';

export interface ServeTypesCount {
    pack: number,
    plate: number
}

interface BucketPlusElement extends Bucket {
    element: string,
    percent: number,
    names: string[],
    serveTypesCount: ServeTypesCount
}

@Injectable()
export class EsSearchService {
    constructor(
        private readonly elasticsearchService: ElasticsearchService,
        private readonly esQueryBaseService: EsQueryBaseService,
        @InjectRepository(CartOrder)
        private readonly cartOrderRepository: Repository<CartOrder>,
        @InjectRepository(CartOrderElement)
        private readonly cartOrderElementRepository: Repository<CartOrderElement>,
        @InjectRepository(MenuElement)
        private readonly menuElementRepository: Repository<MenuElement>
    ) { }
    async dayElements(day: string): Promise<{ list: BucketPlusElement[], total: number, day: string, priceTotal: number, priceExtra: number, bonusPriceTotal: number }> {
        var queryDay = moment.parseZone(day);
        var endOfDay = moment.parseZone(day).add(1, 'd');
        var indexResponse: IndexResponse = await this.elasticsearchService.search({
            index: 'oelements',
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
                    countElements: {
                        terms: {
                            field: "indString",
                            size: 10000
                        },
                        aggs: {
                            ids: {
                                terms: { field: "id" }
                            },
                            serveTypes: {
                                terms: {
                                    field: "serveType"
                                }
                            }
                        }
                    },
                    priceTotal: {
                        sum: {
                            field: "pricePerOne"
                        }
                    },
                    bonusPriceTotal: {
                        sum: {
                            field: "fractionBonusPrice"
                        }
                    },
                    priceExtra: {
                        sum: {
                            field: "priceExtra"
                        }
                    }
                }
            }
        })



        var buckets: Bucket[] = indexResponse.body.aggregations.countElements.buckets

        var bucketList: BucketPlusElement[] = []
        var names: string[] = []
        var namesArray: Array<string[]> = []
        await map(buckets, async (b, i) => {
            names[i] = await this.esQueryBaseService.decodeIndStringCreateName(b.key)
        })

        await map(buckets, async (b, i) => {
            namesArray[i] = await this.prepareNameList(b.ids)
        })

        var findServeType = (serveType: ServeType, buckets: ServeTypesElementsAggs): number => {
            var c: number = 0
            buckets.buckets.map(b => {
                if (b.key == serveType) {
                    c += b.doc_count
                }
            })
            return c
        }

        await map(buckets, async (b, i) => {
            var x = new BigNumber(b.doc_count)
            var y = new BigNumber(indexResponse.body.hits.total.value)

            var p: string = x.div(y).multipliedBy(new BigNumber(100)).toFixed(2)
            bucketList.push({
                doc_count: b.doc_count,
                key: b.key,
                percent: parseFloat(p),
                element: names[i],
                names: namesArray[i],
                serveTypesCount: {
                    plate: findServeType(ServeType.plate, b.serveTypes),
                    pack: findServeType(ServeType.pack, b.serveTypes)
                }
            })
        })
        return {
            list: bucketList,
            total: indexResponse.body.hits.total.value,
            day,
            priceTotal: indexResponse.body.aggregations.priceTotal.value,
            priceExtra: indexResponse.body.aggregations.priceExtra.value,
            bonusPriceTotal: indexResponse.body.aggregations.bonusPriceTotal.value
        }
    }


    async prepareNameList(ids: IdsElementsAggs): Promise<string[]> {
        var names: string[] = []
        var elements: EsIndexElement[] = await this.getElementsByBucketIds(ids)

        await map(elements, async (el, i) => {
            var isIn: boolean = false
            names.map((n, i) => {
                if (n == el.name)
                    isIn = true
            })
            if (!isIn) {
                names.push(el.name)
            }
        })
        return names
    }


    async getElementsByBucketIds(ids: IdsElementsAggs): Promise<EsIndexElement[]> {
        var elements: EsIndexElement[] = []
        await map(ids.buckets, async (b, i) => {
            var indRes: IndexResponse = await this.elasticsearchService.search({
                index: 'oelements',
                body: {
                    query: {
                        term: {
                            id: b.key
                        }
                    }
                }
            })
            indRes.body.hits.hits.map((h, j) => {
                elements.push(h._source)
            })
        })

        return elements
    }

}
