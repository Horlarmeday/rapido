import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  Post,
  Query,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileSetupDto } from './dto/profile-setup.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { DoesUserExist } from '../../core/guards/doesUserExist.guards';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryDto } from '../../common/helpers/url-query.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { Types } from 'mongoose';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(DoesUserExist)
  @Post()
  async register(@Body() createUserDto: CreateUserDto, @Request() req) {
    const result = await this.usersService.register(
      createUserDto,
      req.get('origin'),
    );
    return sendSuccessResponse(Messages.ACCOUNT_CREATED, result);
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findCurrentUser(@Request() req) {
    const result = await this.usersService.getProfile(req.user.sub);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Delete()
  async remove(@Request() req) {
    const result = await this.usersService.removeOne(req.user.sub);
    return sendSuccessResponse(Messages.DELETED, result);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  @Patch()
  async profileSetup(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() profileSetupDto: ProfileSetupDto,
    @Request() req,
  ) {
    const result = await this.usersService.profileSetup(
      req.user.sub,
      profileSetupDto,
      files,
    );
    return sendSuccessResponse(Messages.UPDATED, result);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsers(@Query() queryDto: QueryDto) {
    const result = await this.usersService.getUsers(queryDto);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateUser(
    @Body() updateUserProfileDto: UpdateUserProfileDto,
    @Param('id') id: Types.ObjectId,
  ) {
    const result = await this.usersService.updateUserProfile(
      updateUserProfileDto,
      id,
    );
    return sendSuccessResponse(Messages.UPDATED, result);
  }
}
