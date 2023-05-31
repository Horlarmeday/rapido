import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('specialist')
  async specialistDashboard(@Request() req) {
    const result = await this.dashboardService.specialistDashboard(
      req.user.sub,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }
}
