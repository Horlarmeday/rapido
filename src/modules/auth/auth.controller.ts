import {
  Controller,
  Post,
  Request,
  Body,
  UseGuards,
  Get,
  HttpStatus,
  HttpCode,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Messages } from '../../core/messages/messages';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleOauthGuard } from './guards/google-auth.guard';
import { AppleOauthGuard } from './guards/apple-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { IsEmailVerified } from '../../core/guards/isEmailVerified.guards';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @UseGuards(IsEmailVerified)
  @HttpCode(HttpStatus.OK)
  async loginWithEmail(@Request() req) {
    const result = await this.authService.login(req.user);
    return sendSuccessResponse(
      result ? Messages.USER_AUTHENTICATED : Messages.OTP_SENT,
      result,
    );
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async googleAuth(@Request() req) {
    console.log('Getting Google Oauth');
  }

  @Get('google/redirect')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(@Request() req: Request) {
    const result = await this.authService.googleLogin(req);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get()
  @UseGuards(AppleOauthGuard)
  async appleAuth(@Request() req): Promise<any> {
    console.log('Getting Apple Oauth');
  }

  @Post('apple/redirect')
  @HttpCode(HttpStatus.OK)
  async redirect(@Body() payload): Promise<any> {
    const result = await this.authService.appleLogin(payload);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto);
    return sendSuccessResponse(Messages.PASSWORD_RESET_SENT, null);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);
    return sendSuccessResponse(Messages.PASSWORD_RESET, null);
  }

  @Post('google/alt-login')
  async googleLogin(@Body() token: string) {
    const result = await this.authService.googleAltLogin(token);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @HttpCode(HttpStatus.OK)
  @Post('otp/verify')
  async otpVerify(@Body() otpVerifyDto: OtpVerifyDto) {
    const { token, email } = otpVerifyDto;
    const result = await this.authService.verifyOTP(email, token);
    return sendSuccessResponse(Messages.LOGIN_VERIFIED, result);
  }

  @Get('email/:userId/verify/:token')
  async emailVerify(@Param() params) {
    const { userId, token } = params;
    await this.authService.verifyEmailToken(userId, token);
    return sendSuccessResponse(Messages.EMAIL_VERIFIED, null);
  }

  @UseGuards(JwtAuthGuard)
  @Post('phone/verify')
  async phoneVerify(@Body() body, @Request() req) {
    const { token } = body;
    await this.authService.verifyPhoneToken(req.user.sub, token);
    return sendSuccessResponse(Messages.PHONE_VERIFIED, null);
  }

  @Post('resend-email-token')
  async resendEmailToken(@Body() body) {
    const { email } = body;
    await this.authService.resendEmailToken(email);
    return sendSuccessResponse(Messages.EMAIL_VERIFICATION_SENT, null);
  }

  @UseGuards(JwtAuthGuard)
  @Post('resend-phone-token')
  async resendPhoneToken(@Request() req) {
    await this.authService.resendSMSToken(req.user);
    // Todo: Send token SMS to phone
    return sendSuccessResponse(Messages.PHONE_VERIFICATION_SENT, null);
  }
}
