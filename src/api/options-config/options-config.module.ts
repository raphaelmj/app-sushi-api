import { AppConfig } from './../../entities/AppConfig';
import { DescOptions } from './../../entities/DescOptions';
import { ReverseOptions } from './../../entities/ReverseOptions';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from './../../services/services.module';
import { Module } from '@nestjs/common';
import { OptionsConfigController } from './options-config.controller';

@Module({
  imports: [
    ServicesModule,
    TypeOrmModule.forFeature([
      ReverseOptions,
      DescOptions,
      AppConfig
    ]),
  ],
  controllers: [OptionsConfigController]
})
export class OptionsConfigModule { }
