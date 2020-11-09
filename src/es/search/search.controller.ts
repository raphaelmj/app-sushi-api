import { EsSearchElementsSalesService } from './../../es-services/es-search/es-search-elements-sales.service';
import { EsSearchDateTotalService } from './../../es-services/es-search/es-search-date-total.service';
import { EsSearchOrderService } from './../../es-services/es-search/es-search-order.service';
import { EsUpdateService } from './../../es-services/es-update/es-update.service';
import { EsQueryBaseService } from './../../es-services/es-update/es-query-base.service';
import { EsSearchService } from './../../es-services/es-search/es-search.service';
import { Controller, Get, Param, Query, Res } from '@nestjs/common';

@Controller('es/api/search')
export class SearchController {
    constructor(
        private readonly esSearchService: EsSearchService,
        private readonly esSearchDateTotalService: EsSearchDateTotalService,
        private readonly esSearchOrderService: EsSearchOrderService,
        private readonly esSearchElementsSalesService: EsSearchElementsSalesService,
        private readonly eQueryBaseService: EsQueryBaseService,
        private readonly esUpdateService: EsUpdateService
    ) { }

    @Get('day/elements')
    async index(@Res() res, @Query() query) {
        return res.json(await this.esSearchService.dayElements(query.day))
    }

    @Get('day/stats')
    async indexOrders(@Res() res, @Query() query) {
        return res.json(await this.esSearchOrderService.dayStats(query.day))
    }

    @Get('date/total/stats')
    async dateTotalStats(@Res() res, @Query() query) {
        return res.json(await this.esSearchDateTotalService.search(query))
    }

    @Get('elements/sales/stats')
    async elementsSalesStats(@Res() res, @Query() query) {
        return res.json(await this.esSearchElementsSalesService.search(query))
    }

}
