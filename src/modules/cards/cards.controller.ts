import {
  Controller,
  Get,
  UseGuards,
  Request,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CardsService } from './cards.service';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { MakeCardDefaultDto } from './dto/make-card-default.dto';
import { DeleteCardDto } from './dto/delete-card.dto';

@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  async getUserCards(@Request() req) {
    const result = await this.cardsService.getUserCards(req.user.sub);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Patch()
  async makeCardDefault(@Body() makeCardDefaultDto: MakeCardDefaultDto) {
    const result = await this.cardsService.makeCardDefault(makeCardDefaultDto);
    return sendSuccessResponse(Messages.UPDATED, result);
  }

  @Delete()
  async deleteCard(@Body() deleteCardDto: DeleteCardDto) {
    const result = await this.cardsService.removeCard(deleteCardDto.cardId);
    return sendSuccessResponse(Messages.DELETED, result);
  }
}
