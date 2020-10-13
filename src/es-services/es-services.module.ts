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
    providers: [EsSearchService, EsUpdateService, EsMappingService, EsQueryBaseService],
    exports: [EsSearchService, EsUpdateService, EsMappingService, EsQueryBaseService]
})
export class EsServicesModule { }
