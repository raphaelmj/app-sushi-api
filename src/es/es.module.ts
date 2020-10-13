import { EsServicesModule } from './../es-services/es-services.module';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { Module } from '@nestjs/common';
import { SearchController } from './search/search.controller';


@Module({
    imports: [
        ElasticsearchModule.register({
            node: 'http://localhost:9200',
        }),
        EsServicesModule
    ],
    controllers: [SearchController]
})
export class EsModule { }
