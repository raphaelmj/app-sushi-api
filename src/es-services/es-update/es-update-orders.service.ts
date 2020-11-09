import { map } from 'p-iteration';
import { EsQueryOrdersBaseService } from './es-query-orders-base.service';
import { EsOrderIndexElement } from './../../interfaces/es/es-order-index-element.interface';
import { CartOrder } from 'src/entities/CartOrder';
import { EsMappingService } from './../es-mapping/es-mapping.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as esOrder from "../../interfaces/es/order-index-response.interface";
import * as moment from "moment"

@Injectable()
export class EsUpdateOrdersService {

    readonly indexName: string = "orders"

    constructor(
        private readonly elasticsearchService: ElasticsearchService,
        private readonly esMappingService: EsMappingService,
        private readonly esQueryOrdersBaseService: EsQueryOrdersBaseService,
        @InjectRepository(CartOrder)
        private readonly cartOrderRepository: Repository<CartOrder>,
    ) {

    }


    async createIndex() {

        var existsBool = await this.elasticsearchService.indices.exists({ index: this.indexName })

        if (existsBool.body) {
            await this.elasticsearchService.indices.delete({
                index: this.indexName
            })
        }

        await this.elasticsearchService.indices.create({
            index: this.indexName
        })


        return await this.elasticsearchService.indices.putMapping({
            index: this.indexName,
            body: {
                properties: this.esMappingService.nestedMappings()
            }
        })
    }


    async updateIndexFromAll(clear: boolean = false) {
        if (clear)
            await this.createIndex()

        var elements: EsOrderIndexElement[] = await this.esQueryOrdersBaseService.getCartOrdersList()

        await this.createIndexElements(elements)
    }

    async createOneOrderIndex(order: CartOrder) {
        var el: EsOrderIndexElement = await this.esQueryOrdersBaseService.orderElementPrepare(order)
        await this.createIndexElement(el)
    }

    async orderDataUpdate(order: CartOrder) {
        var oel: EsOrderIndexElement = await this.esQueryOrdersBaseService.orderElementPrepare(await this.cartOrderRepository.findOne({ where: { id: order.id }, relations: ['cartOrderElements'] }))
        await this.elasticsearchService.deleteByQuery({
            index: this.indexName,
            body: {
                query: {
                    term: {
                        oId: order.id
                    }
                }
            }
        })
        await this.createIndexElement(oel)
    }

    async orderDateUpdate(order: CartOrder) {
        var r: esOrder.EsOrder.EsOrderIndexResponse = await this.elasticsearchService.search({
            index: this.indexName,
            body: {
                query: {
                    term: {
                        oId: order.id
                    }
                }
            }
        })
        await map(r.body.hits.hits, async (h, i) => {
            await this.elasticsearchService.indices.refresh({ index: this.indexName })
            await this.elasticsearchService.update({
                index: this.indexName,
                id: h._id,
                body: {
                    doc: {
                        endAt: moment(order.endAt).format('YYYY-MM-DD HH:mm:ss'),
                        endDay: moment(order.endDay).format('YYYY-MM-DD'),
                        weekDay: this.esQueryOrdersBaseService.getWeekDay(order.endDay),
                    }
                }
            })

        })
    }

    async addElementToOrder(order: CartOrder) {
        var oel: EsOrderIndexElement = await this.esQueryOrdersBaseService.orderElementPrepare(await this.cartOrderRepository.findOne({ where: { id: order.id }, relations: ['cartOrderElements'] }))
        await this.elasticsearchService.deleteByQuery({
            index: this.indexName,
            body: {
                query: {
                    term: {
                        oId: order.id
                    }
                }
            }
        })
        await this.createIndexElement(oel)
    }

    async removeOrderElement(order: CartOrder) {
        var oel: EsOrderIndexElement = await this.esQueryOrdersBaseService.orderElementPrepare(await this.cartOrderRepository.findOne({ where: { id: order.id }, relations: ['cartOrderElements'] }))
        await this.elasticsearchService.deleteByQuery({
            index: this.indexName,
            body: {
                query: {
                    term: {
                        oId: order.id
                    }
                }
            }
        })
        await this.createIndexElement(oel)
    }

    async createIndexElement(el: EsOrderIndexElement) {
        await this.elasticsearchService.indices.refresh({ index: this.indexName })
        await this.elasticsearchService.index({
            index: this.indexName,
            body: el
        })
    }

    async createIndexElements(elements: EsOrderIndexElement[]) {
        await map(elements, async (el: EsOrderIndexElement, i) => {
            await this.elasticsearchService.indices.refresh({ index: this.indexName })
            await this.elasticsearchService.index({
                index: this.indexName,
                body: el
            })
        })
    }

}
