import {
  Controller,
  Post,
  Request,
  Body,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Messages } from '../../core/messages/messages';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AppleOauthGuard } from './guards/apple-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async register(@Body() createUserDto: CreateUserDto) {
    const result = await this.authService.register(createUserDto);
    return sendSuccessResponse(Messages.ACCOUNT_CREATED, result);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async loginWithEmail(@Request() req) {
    const result = await this.authService.login(req.user);
    return sendSuccessResponse(Messages.USER_AUTHENTICATED, result);
  }

  @Get()
  @UseGuards(AppleOauthGuard)
  async appleAuth(@Request() req): Promise<any> {
    console.log('Getting Apple Oauth');
  }

  @Post('apple/redirect')
  async redirect(@Body() payload): Promise<any> {
    const result = await this.authService.appleLogin(payload);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Post('google')
  async googleLogin(@Body() token: string): Promise<any> {
    const result = await this.authService.googleLogin(token);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }
}
