import { EsIndexElement } from './../../interfaces/es/es-index-element.interface';
import { EsQueryBaseService } from './../es-update/es-query-base.service';
import { MenuElement } from 'src/entities/MenuElement';
import { CartOrderElement } from 'src/entities/CartOrderElement';
import { map } from 'p-iteration';
import { IndexElementsResponse } from './../../interfaces/es/elements-index-response.interface';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { InjectRepository } from '@nestjs/typeorm';
import { CartOrder } from 'src/entities/CartOrder';
import { Repository } from 'typeorm';
import BigNumber from "bignumber.js"
import { ServeType } from 'src/interfaces/cart-order-element-data.interface';


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
    async dayElements(day: string): Promise<IndexElementsResponse> {
        var queryDay = moment.parseZone(day);
        var endOfDay = moment.parseZone(day).add(1, 'd');
        var indexResponse: IndexElementsResponse = await this.elasticsearchService.search({
            index: 'oelements',
            body: {
                "query": {
                    "range": {
                        "endAt": {
                            "gte": queryDay.format('yy-MM-DD HH:mm:ss'),
                            "lte": endOfDay.format('yy-MM-DD HH:mm:ss')
                        }
                    }
                }
            }
        })
        return indexResponse
    }



    async getElementsNamesFromIndStringRangeDate(indString: string, fromDate: string, toDate: string): Promise<string[]> {

        var indRes: IndexElementsResponse = await this.elasticsearchService.search({
            index: 'oelements',
            body: {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "range": {
                                    "endAt": {
                                        "gte": fromDate,
                                        "lte": toDate
                                    }
                                }
                            },
                            {
                                "term": {
                                    "indString": {
                                        "value": indString
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        })
        var names: string[] = []
        await map(indRes.body.hits.hits, async (el, i) => {
            var isIn: boolean = false
            names.map((n, i) => {
                if (n == el._source.name)
                    isIn = true
            })
            if (!isIn) {
                names.push(el._source.name)
            }
        })
        return names

    }

}
