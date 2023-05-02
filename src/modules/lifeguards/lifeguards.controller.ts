import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
  Request,
  UseGuards,
  Get,
} from '@nestjs/common';
import { LifeguardsService } from './lifeguards.service';
import { CreateLifeguardDto } from './dto/create-lifeguard.dto';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { LifeguardLoginDto } from './dto/lifeguard-login.dto';
import { AppleLoginDto } from '../auth/dto/apple-login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { SetPreferencesDto } from './dto/set-preferences.dto';
import { JwtGuard } from './guards/jwt.guards';
import { DoesUserExist } from './guards/does-user-exists.guards';
import { EmailOtpVerifyDto } from '../auth/dto/email-otp-verify.dto';
import { ResendEmailOtpDto } from '../auth/dto/resend-email-otp.dto';
import { IsEmailVerified } from './guards/is-email-verified.guards';
import { FinishAddPaymentMethodDto } from './dto/finish-add-payment-method.dto';

@Controller('lifeguards')
export class LifeguardsController {
  constructor(private readonly lifeguardsService: LifeguardsService) {}

  @UseGuards(DoesUserExist)
  @Post()
  async createLifeguard(@Body() createLifeguardDto: CreateLifeguardDto) {
    const result = await this.lifeguardsService.localRegistration(
      createLifeguardDto,
    );
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(IsEmailVerified)
  @Post('login')
  async login(@Body() lifeguardLoginDto: LifeguardLoginDto) {
    const result = await this.lifeguardsService.login(lifeguardLoginDto);
    return sendSuccessResponse(Messages.USER_AUTHENTICATED, result);
  }

  @Post('apple')
  @HttpCode(HttpStatus.OK)
  async appleLogin(@Body() appleLoginDto: AppleLoginDto): Promise<any> {
    const result = await this.lifeguardsService.appleLogin(appleLoginDto);
    return sendSuccessResponse(Messages.USER_AUTHENTICATED, result);
  }

  @HttpCode(HttpStatus.OK)
  @Post('google')
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    const { token } = googleLoginDto;
    const result = await this.lifeguardsService.googleLogin(token);
    return sendSuccessResponse(Messages.USER_AUTHENTICATED, result);
  }

  @UseGuards(JwtGuard)
  @Patch('preference')
  async setPreference(
    @Body() setPreferencesDto: SetPreferencesDto,
    @Request() req,
  ) {
    const result = await this.lifeguardsService.setPreference(
      req.user.sub,
      setPreferencesDto,
    );
    return sendSuccessResponse(Messages.UPDATED, result);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  async getProfile(@Request() req) {
    const result = await this.lifeguardsService.getLifeguardProfile(
      req.user.sub,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @Post('add-payment-method')
  async beginAddPaymentMethod(@Request() req) {
    const result = await this.lifeguardsService.beginAddPaymentMethod(req.user);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @Post('verify-payment-method')
  async finishAddPaymentMethod(
    @Body() finishAddPaymentMethodDto: FinishAddPaymentMethodDto,
    @Request() req,
  ) {
    const result = await this.lifeguardsService.finishAddPaymentMethod(
      finishAddPaymentMethodDto.reference,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }
  @HttpCode(HttpStatus.OK)
  @Post('resend-email-token')
  async resendEmailOtp(@Body() resendEmailOtpDto: ResendEmailOtpDto) {
    await this.lifeguardsService.resendEmailToken(resendEmailOtpDto);
    return sendSuccessResponse(Messages.EMAIL_OTP_SENT, null);
  }

  @HttpCode(HttpStatus.OK)
  @Post('email/verify')
  async verifyPhoneOTP(@Body() phoneOtpVerifyDto: EmailOtpVerifyDto) {
    const { token, email } = phoneOtpVerifyDto;
    await this.lifeguardsService.verifyEmail(email, token);
    return sendSuccessResponse(Messages.EMAIL_VERIFIED, null);
  }
}
