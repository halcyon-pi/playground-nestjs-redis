import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Post,
} from '@nestjs/common';
import { AddJobDto } from 'src/add-job.request.dto';
import { CacheService } from 'src/cache.service';
import { QueueService } from 'src/queue.service';
import { SetCacheDto } from 'src/set-cache.request.dto';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly cacheService: CacheService,
    private readonly queueService: QueueService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('set-unique-cache')
  @HttpCode(201)
  async setCache(@Body() body: SetCacheDto) {
    const previousValue = await this.cacheService.get(body.key);
    if (previousValue) {
      throw new HttpException(`Key already exists: ${body.key}`, 400);
    }
    return this.cacheService.add(body);
  }

  @Post('add-job')
  @HttpCode(201)
  async addJob(@Body() body: AddJobDto) {
    return this.queueService.add({ name: body.name, data: body.data });
  }
}
