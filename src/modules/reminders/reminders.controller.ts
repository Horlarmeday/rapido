import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';

@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  async create(@Body() createReminderDto: CreateReminderDto, @Request() req) {
    const result = await this.remindersService.createReminder(
      createReminderDto,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @Get()
  async findUserReminders(@Request() req) {
    const result = await this.remindersService.getUserReminders(req.user.sub);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReminderDto: UpdateReminderDto,
  ) {
    const result = await this.remindersService.updateReminder(
      id,
      updateReminderDto,
    );
    return sendSuccessResponse(Messages.UPDATED, result);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.remindersService.removeReminder(id);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }
}
