import { EsUpdateService } from './../../es-services/es-update/es-update.service';
import { EsQueryBaseService } from './../../es-services/es-update/es-query-base.service';
import { EsSearchService } from './../../es-services/es-search/es-search.service';
import { Controller, Get, Param, Query, Res } from '@nestjs/common';

@Controller('es/api/search')
export class SearchController {
    constructor(
        private readonly esSearchService: EsSearchService,
        private readonly eQueryBaseService: EsQueryBaseService,
        private readonly esUpdateService: EsUpdateService
    ) { }

    @Get('day/elements')
    async index(@Res() res, @Query() query) {
        return res.json(await this.esSearchService.dayElements(query.day))
    }

}
