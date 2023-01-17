import {
  Controller,
  Get,
  Body,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { CreateUserSettingDto } from './dto/create-user-setting.dto';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get()
  async findOne(@Request() req) {
    return this.userSettingsService.findOne(req.user.sub);
  }

  @Patch()
  async update(
    @Request() req,
    @Body() createUserSettingDto: CreateUserSettingDto,
  ) {
    const result = await this.userSettingsService.updateSetting(
      createUserSettingDto,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.UPDATED, result);
  }
}
