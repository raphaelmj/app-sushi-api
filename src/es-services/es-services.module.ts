import { AppConfig } from './../entities/AppConfig';
import { ServicesModule } from 'src/services/services.module';
import { CartOrder } from './../entities/CartOrder';
import { User } from 'src/entities/User';
import { CartOrderElement } from 'src/entities/CartOrderElement';
import { MenuCategory } from 'src/entities/MenuCategory';
import { CartCategory } from 'src/entities/CartCategory';
import { MenuElement } from 'src/entities/MenuElement';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { Module } from '@nestjs/common';
import { EsSearchService } from './es-search/es-search.service';
import { EsUpdateService } from './es-update/es-update.service';
import { EsMappingService } from './es-mapping/es-mapping.service';
import { EsQueryBaseService } from './es-update/es-query-base.service';
import { EsUpdateOrdersService } from './es-update/es-update-orders.service';
import { EsQueryOrdersBaseService } from './es-update/es-query-orders-base.service';
import { EsSearchOrderService } from './es-search/es-search-order.service';
import { EsPainlessScriptsService } from './es-painless-scripts/es-painless-scripts.service';
import { EsSearchDateTotalService } from './es-search/es-search-date-total.service';
import { EsSearchElementsSalesService } from './es-search/es-search-elements-sales.service';

@Module({
    imports: [
        ElasticsearchModule.register({
            node: 'http://localhost:9200',
        }),
        TypeOrmModule.forFeature([
            User,
            CartOrder,
            CartOrderElement,
            MenuCategory,
            CartCategory,
            MenuElement,
            AppConfig
        ]),
        ServicesModule
    ],
    providers: [
        EsSearchService,
        EsUpdateService,
        EsMappingService,
        EsQueryBaseService,
        EsUpdateOrdersService,
        EsQueryOrdersBaseService,
        EsSearchOrderService,
        EsPainlessScriptsService,
        EsSearchDateTotalService,
        EsSearchElementsSalesService
    ],
    exports: [
        EsSearchService,
        EsUpdateService,
        EsMappingService,
        EsQueryBaseService,
        EsUpdateOrdersService,
        EsQueryOrdersBaseService,
        EsSearchOrderService,
        EsSearchDateTotalService,
        EsSearchElementsSalesService
    ]
})
export class EsServicesModule { }
