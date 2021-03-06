import { query } from 'express';
import { IndexElementsResponse } from './../../interfaces/es/elements-index-response.interface';
import { map } from 'p-iteration';
import { EsIndexElement } from './../../interfaces/es/es-index-element.interface';
import { EsQueryBaseService } from './es-query-base.service';
import { MenuElement } from './../../entities/MenuElement';
import { CartOrderElement } from './../../entities/CartOrderElement';
import { CartOrder } from 'src/entities/CartOrder';
import { EsMappingService } from './../es-mapping/es-mapping.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from "moment"

@Injectable()
export class EsUpdateService {

    readonly indexName: string = 'oelements'

    constructor(
        private readonly elasticsearchService: ElasticsearchService,
        private readonly esMappingService: EsMappingService,
        private readonly esQueryBaseService: EsQueryBaseService,
        @InjectRepository(CartOrder)
        private readonly cartOrderRepository: Repository<CartOrder>,
        @InjectRepository(CartOrderElement)
        private readonly cartOrderElementRepository: Repository<CartOrderElement>,
        @InjectRepository(MenuElement)
        private readonly menuElementRepository: Repository<MenuElement>,
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
                properties: this.esMappingService.flatMapping()
            }
        })
    }


    async updateIndexFromAll(clear: boolean = false) {
        if (clear)
            await this.createIndex()

        var elements: EsIndexElement[] = await this.esQueryBaseService.getCartElementsList()

        await this.createIndexElements(elements)
    }


    async createIndexElementsFromOrder(order: CartOrder): Promise<EsIndexElement[]> {
        var elements: EsIndexElement[] = await this.esQueryBaseService.getEsElementsFromOrder(order)
        await this.createIndexElements(elements)
        return elements
    }

    async elementDataUpdate(order: CartOrder) {
        var elements: EsIndexElement[] = await this.esQueryBaseService.getEsElementsFromOrder(await this.cartOrderRepository.findOne({ where: { id: order.id }, relations: ['cartOrderElements'] }))
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
        await this.createIndexElements(elements)
    }

    async elementsDateUpdate(order: CartOrder) {
        var r: IndexElementsResponse = await this.elasticsearchService.search({
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
                        weekDay: this.esQueryBaseService.getWeekDay(order.endDay),
                    }
                }
            })

        })
    }

    async addElementToOrder(order: CartOrder) {
        var elements: EsIndexElement[] = await this.esQueryBaseService.getEsElementsFromOrder(await this.cartOrderRepository.findOne({ where: { id: order.id }, relations: ['cartOrderElements'] }))
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
        await this.createIndexElements(elements)
    }

    async removeElement(order: CartOrder) {
        var elements: EsIndexElement[] = await this.esQueryBaseService.getEsElementsFromOrder(await this.cartOrderRepository.findOne({ where: { id: order.id }, relations: ['cartOrderElements'] }))
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
        await this.createIndexElements(elements)
    }

    async removeElementNotReIndex(order: CartOrder) {
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
    }

    async createIndexElements(elements: EsIndexElement[]) {
        await map(elements, async (el: EsIndexElement, i) => {
            await this.elasticsearchService.indices.refresh({ index: this.indexName })
            await this.elasticsearchService.index({
                index: this.indexName,
                body: el
            })
        })
    }

}
