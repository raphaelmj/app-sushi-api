import { Controller, Get, Res } from '@nestjs/common';
import { join } from 'path';
import { Server } from 'socket.io';
import { WebSocketServer } from '@nestjs/websockets';
import { EventsGateway } from './events.gateway';
import { SiteService } from './services/site/site.service';
import { AnchorService } from './services/anchor/anchor.service';
import { SchedulerRegistry } from '@nestjs/schedule';


@Controller()
export class AppController {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly eventGateway: EventsGateway,
    private readonly siteService: SiteService,
    private readonly anchorService: AnchorService,
    private schedulerRegistry: SchedulerRegistry,
  ) { }

  @Get()
  async index(@Res() res) {
    return res.sendFile(join(process.cwd() + '/ngadmin/index.html'));
  }

  @Get('jobs')
  async checkJobs(@Res() res) {
    const job = this.schedulerRegistry.getCronJob('reservations');
    return res.json(job.lastDate())
  }

  @Get('sites')
  async getSitesOne(@Res() res) {
    return res.json(await this.siteService.getOneName());
  }

  @Get('sites2')
  async getSitesMany(@Res() res) {
    return res.json(await this.siteService.getManyNames());
  }

  @Get('sites3')
  async getConfig(@Res() res) {
    return res.json(await this.siteService.getConfigPrice());
  }

  @Get('sites4')
  async getDesc(@Res() res) {
    return res.json(await this.siteService.getAll());
  }

  @Get('anchors')
  async getAnchs(@Res() res) {
    return res.json(await this.anchorService.getAll());
  }


}
