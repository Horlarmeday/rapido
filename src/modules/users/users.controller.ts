import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileSetupDto } from './dto/profile-setup.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findCurrentUser(@Request() req) {
    const result = await this.usersService.getProfile(req.user.sub);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  // @Get(':id')
  // async findOne(@Param('id') id: Types.ObjectId) {
  //   const result = await this.usersService.findById(id);
  //   return sendSuccessResponse(Messages.RETRIEVED, result);
  // }
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.usersService.removeOne(id);
    return sendSuccessResponse(Messages.DELETED, result);
  }
  @UseInterceptors(AnyFilesInterceptor())
  @Patch('profile-setup')
  @UseGuards(JwtAuthGuard)
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
}
