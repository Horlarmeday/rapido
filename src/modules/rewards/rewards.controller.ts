import { Controller, Get, Request } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  async getUserTotalRewards(@Request() req) {
    const result = await this.rewardsService.getUserTotalRewards(req.user.sub);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get('list')
  async getUserRewards(@Request() req) {
    const result = await this.rewardsService.getUserEarnedRewards(req.user.sub);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }
}
