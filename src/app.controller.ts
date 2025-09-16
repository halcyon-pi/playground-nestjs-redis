import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Post,
} from '@nestjs/common';
import { CacheService } from 'src/cache.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('set-unique-cache')
  @HttpCode(201)
  async setCache(@Body() body: { key: string; value: string }) {
    const previousValue = await this.cacheService.get(body.key);
    if (previousValue) {
      throw new HttpException('Key already exists', 400);
    }
    return this.cacheService.add(body);
  }
}
