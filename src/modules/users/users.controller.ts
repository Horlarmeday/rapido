import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { DoesUserExist } from '../../core/guards/doesUserExist.guards';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.usersService.findById(id);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.usersService.removeOne(id);
    return sendSuccessResponse(Messages.DELETED, result);
  }
}
