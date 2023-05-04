import {
  Controller,
  Post,
  Body,
  Patch,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { UpdateReferralsDto } from './dto/update-referrals.dto';

@UseGuards(JwtAuthGuard)
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post()
  async createReferral(@Request() req) {
    const result = await this.referralsService.createReferral(req.user.sub);
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @Patch()
  async updateReferrals(@Body() updateReferralsDto: UpdateReferralsDto) {
    const { referral_code, referee } = updateReferralsDto;
    const result = await this.referralsService.updateReferrals(
      referee,
      referral_code,
    );
    return sendSuccessResponse(Messages.UPDATED, result);
  }

  @Get('me')
  async getUserReferralCode(@Request() req) {
    const result = await this.referralsService.getUserReferral(req.user.sub);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get(':code')
  async getReferralByCode(@Param('code') code: string) {
    const result = await this.referralsService.getReferralByCode(code);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }
}
