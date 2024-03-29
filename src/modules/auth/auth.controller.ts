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
  Patch,
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
import { ChangePhoneNumberDto } from './dto/change-phone-number.dto';
import { IsUserActive } from '../../core/guards/isUserActive.guards';
import { ChangeEmailAddressDto } from './dto/change-email-address.dto';
import { VerifyPhoneNumberChangeDto } from './dto/verify-phone-number-change.dto';
import { VerifyEmailChangeDto } from './dto/verify-email-change.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @UseGuards(IsAuthorized)
  @UseGuards(IsEmailVerified)
  @UseGuards(IsUserActive)
  @HttpCode(HttpStatus.OK)
  async loginWithEmail(@Request() req) {
    const { message, result } = await this.authService.login(req.user);
    return sendSuccessResponse(message, result);
  }

  @Post('apple')
  @HttpCode(HttpStatus.OK)
  async appleLogin(@Body() appleLoginDto: AppleLoginDto): Promise<any> {
    const result = await this.authService.appleLogin(appleLoginDto);
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
    const { otpAuthUrl, secret } =
      await this.authService.generateTwoFactorAuthSecret(req.user.sub);
    const dataUrl = await this.authService.pipeQrCodeStream(otpAuthUrl);
    return sendSuccessResponse(Messages.RETRIEVED, { secret, dataUrl });
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

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('change-phone-number')
  async changePhoneNumber(
    @Body() changePhoneNumberDto: ChangePhoneNumberDto,
    @Request() req,
  ) {
    await this.authService.changePhoneNumber(
      req.user.sub,
      changePhoneNumberDto,
    );
    return sendSuccessResponse(Messages.PHONE_VERIFICATION_SENT, null);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('verify-phone-number-change')
  async verifyPhoneNumberChange(
    @Body() verifyPhoneNumberChangeDto: VerifyPhoneNumberChangeDto,
    @Request() req,
  ) {
    await this.authService.verifyPhoneNumberChange(
      req.user.sub,
      verifyPhoneNumberChangeDto,
    );
    return sendSuccessResponse(Messages.PHONE_NUMBER_CHANGED, null);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('change-email-address')
  async changeEmailAddress(
    @Body() changeEmailAddressDto: ChangeEmailAddressDto,
    @Request() req,
  ) {
    await this.authService.changeEmailAddress(
      req.user.sub,
      changeEmailAddressDto,
    );
    return sendSuccessResponse(Messages.EMAIL_VERIFICATION_SENT, null);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('verify-email-address-change')
  async verifyEmailAddressChange(
    @Body() verifyEmailChangeDto: VerifyEmailChangeDto,
    @Request() req,
  ) {
    await this.authService.verifyEmailAddressChange(
      req.user.sub,
      verifyEmailChangeDto,
    );
    return sendSuccessResponse(Messages.EMAIL_CHANGED, null);
  }
}
