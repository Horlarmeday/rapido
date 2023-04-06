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
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailOtpVerifyDto } from './dto/email-otp-verify.dto';
import { IsEmailVerified } from '../../core/guards/isEmailVerified.guards';
import { PhoneVerifyDto } from './dto/phone-verify.dto';
import { EmailVerificationTokenDto } from './dto/email-verification-token.dto';
import { PhoneTokenDto } from './dto/phone-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TwoFACodeDto } from './dto/twoFA-code.dto';
import { ResendEmailOtpDto } from './dto/resend-email-otp.dto';
import { PhoneOtpVerifyDto } from './dto/phone-otp-verify.dto';
import { ResendPhoneOtpDto } from './dto/resend-phone-otp.dto';
import { IsAuthorized } from '../../core/guards/isAuthorized.guards';
import { GoogleLoginDto } from './dto/google-login.dto';
import { AppleLoginDto } from './dto/apple-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @UseGuards(IsAuthorized)
  @UseGuards(IsEmailVerified)
  @HttpCode(HttpStatus.OK)
  async loginWithEmail(@Request() req) {
    const { message, result } = await this.authService.login(req.user);
    return sendSuccessResponse(message, result);
  }

  @Post('apple')
  @HttpCode(HttpStatus.OK)
  async appleLogin(@Body() appleLoginDto: AppleLoginDto): Promise<any> {
    const { payload, user_type } = appleLoginDto;
    const result = await this.authService.appleLogin(payload, user_type);
    return sendSuccessResponse(Messages.USER_AUTHENTICATED, result);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Request() req,
  ) {
    await this.authService.forgotPassword(forgotPasswordDto, req.get('origin'));
    return sendSuccessResponse(Messages.PASSWORD_RESET_SENT, null);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);
    return sendSuccessResponse(Messages.PASSWORD_RESET, null);
  }

  @HttpCode(HttpStatus.OK)
  @Post('google/alt-login')
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    const { token, user_type } = googleLoginDto;
    const result = await this.authService.googleAltLogin(token, user_type);
    return sendSuccessResponse(Messages.USER_AUTHENTICATED, result);
  }

  @HttpCode(HttpStatus.OK)
  @Post('otp/verify')
  async verifyEmailOTP(@Body() otpVerifyDto: EmailOtpVerifyDto) {
    const { token, email } = otpVerifyDto;
    const result = await this.authService.verifyEmailOTP(email, token);
    return sendSuccessResponse(Messages.LOGIN_VERIFIED, result);
  }

  @HttpCode(HttpStatus.OK)
  @Post('otp/phone/verify')
  async verifyPhoneOTP(@Body() phoneOtpVerifyDto: PhoneOtpVerifyDto) {
    const { code, email } = phoneOtpVerifyDto;
    const result = await this.authService.verifyPhoneOTP(email, code);
    return sendSuccessResponse(Messages.LOGIN_VERIFIED, result);
  }

  @Get('email/:userId/verify/:token')
  async emailVerify(@Param() params) {
    const { userId, token } = params;
    await this.authService.verifyEmail(userId, token);
    return sendSuccessResponse(Messages.EMAIL_VERIFIED, null);
  }

  @HttpCode(HttpStatus.OK)
  @Post('phone/verify')
  async phoneVerify(@Body() phoneVerify: PhoneVerifyDto) {
    const { code, phone } = phoneVerify;
    await this.authService.verifyPhone(phone, code);
    return sendSuccessResponse(Messages.PHONE_VERIFIED, null);
  }

  @HttpCode(HttpStatus.OK)
  @Post('resend-email-token')
  async resendEmailToken(
    @Body() emailVerificationTokenDto: EmailVerificationTokenDto,
    @Request() req,
  ) {
    const { userId } = emailVerificationTokenDto;
    await this.authService.resendEmailToken(userId, req.get('origin'));
    return sendSuccessResponse(Messages.EMAIL_VERIFICATION_SENT, null);
  }

  @HttpCode(HttpStatus.OK)
  @Post('resend-phone-token')
  async resendPhoneToken(@Body() phoneToken: PhoneTokenDto) {
    await this.authService.resendSMSToken(phoneToken);
    return sendSuccessResponse(Messages.PHONE_VERIFICATION_SENT, null);
  }

  @HttpCode(HttpStatus.OK)
  @Post('resend-email-otp')
  async resendEmailOtp(@Body() resendEmailOtpDto: ResendEmailOtpDto) {
    await this.authService.resendEmailOTP(resendEmailOtpDto);
    return sendSuccessResponse(Messages.EMAIL_OTP_SENT, null);
  }

  @HttpCode(HttpStatus.OK)
  @Post('resend-phone-otp')
  async resendPhoneOtp(@Body() resendPhoneOtpDto: ResendPhoneOtpDto) {
    await this.authService.resendPhoneOTP(resendPhoneOtpDto);
    return sendSuccessResponse(Messages.PHONE_OTP_SENT, null);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async generate2FA(@Request() req) {
    const { otpAuthUrl } = await this.authService.generateTwoFactorAuthSecret(
      req.user.sub,
    );
    return sendSuccessResponse(
      Messages.RETRIEVED,
      await this.authService.pipeQrCodeStream(otpAuthUrl),
    );
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('2fa/turn-on')
  async turnOn2FAAuthentication(
    @Body() twoFACodeDto: TwoFACodeDto,
    @Request() req,
  ) {
    await this.authService.turnOn2FAAuthentication(twoFACodeDto, req.user.sub);
    return sendSuccessResponse(Messages.TWO_FA_TURNED_ON, null);
  }

  @HttpCode(HttpStatus.OK)
  @Post('2fa/verify')
  async verify2FACode(@Body() twoFACodeDto: TwoFACodeDto, @Body() body) {
    const result = await this.authService.verify2FACode(
      body.email,
      twoFACodeDto,
    );
    return sendSuccessResponse(Messages.LOGIN_VERIFIED, result);
  }
}
