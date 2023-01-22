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
  Response,
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
import { PhoneVerifyDto } from './dto/phone-verify.dto';
import { EmailTokenDto } from './dto/email-token.dto';
import { PhoneTokenDto } from './dto/phone-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TwoFACodeDto } from './dto/twoFA-code.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @UseGuards(IsEmailVerified)
  @HttpCode(HttpStatus.OK)
  async loginWithEmail(@Request() req) {
    const { message, result } = await this.authService.login(req.user);
    return sendSuccessResponse(message, result);
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

  @HttpCode(HttpStatus.OK)
  @Post('google/alt-login')
  async googleLogin(@Body() token: string) {
    const result = await this.authService.googleAltLogin(token);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @HttpCode(HttpStatus.OK)
  @Post('otp/verify')
  async verifyEmailOTP(@Body() otpVerifyDto: OtpVerifyDto) {
    const { token, email } = otpVerifyDto;
    const result = await this.authService.verifyOTP(email, token);
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
  async resendEmailToken(@Body() emailToken: EmailTokenDto) {
    const { email } = emailToken;
    await this.authService.resendEmailToken(email);
    return sendSuccessResponse(Messages.EMAIL_VERIFICATION_SENT, null);
  }

  @HttpCode(HttpStatus.OK)
  @Post('resend-phone-token')
  async resendPhoneToken(@Body() phoneToken: PhoneTokenDto) {
    await this.authService.resendSMSToken(phoneToken);
    return sendSuccessResponse(Messages.PHONE_VERIFICATION_SENT, null);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async generate2FA(@Request() req, @Response() res) {
    const { otpAuthUrl } = await this.authService.generateTwoFactorAuthSecret(
      req.user.sub,
    );
    return this.authService.pipeQrCodeStream(res, otpAuthUrl);
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
