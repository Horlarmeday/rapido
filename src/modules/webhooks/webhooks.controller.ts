import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Response } from 'express';
import { WebhooksService } from './webhooks.service';
import { interval, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @HttpCode(HttpStatus.OK)
  @Post()
  async create(@Body() body, @Res() res: Response) {
    await this.webhooksService.createWebhook(body);
    return res.sendStatus(200);
  }

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    const data = this.webhooksService.sendEvent();
    return interval(1000).pipe(map(() => ({ data })));
  }
}
