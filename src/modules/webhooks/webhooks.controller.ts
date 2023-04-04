import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @HttpCode(HttpStatus.OK)
  @Post()
  async create(@Body() body, @Res() res: Response) {
    await this.webhooksService.createWebhook(body);
    return res.sendStatus(200);
  }
}
