import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import {
  RegMedium,
  UserDocument,
  UserType,
} from '../users/entities/user.entity';
import { IJwtPayload } from './types/jwt-payload.type';
import { JwtService } from '@nestjs/jwt';
import { Messages } from '../../core/messages/messages';
import { SocialMediaUserType } from './types/social-media.type';
import { TokensService } from '../tokens/tokens.service';
import { TokenType } from '../tokens/entities/token.entity';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Types } from 'mongoose';
import { verificationEmail } from '../../core/emails/mails/verificationEmail';
import { forgotPasswordEmail } from '../../core/emails/mails/forgotPasswordEmail';
import { passwordResetEmail } from '../../core/emails/mails/passwordResetEmail';
import { GoogleAuth } from './strategies/googleAuth.strategy';
import { UserSettingsService } from '../user-settings/user-settings.service';
import * as moment from 'moment';
import { Twilio } from '../../common/external/twilio/twilio';
import { APPROVED } from '../../core/constants';
import { PhoneTokenDto } from './dto/phone-token.dto';
import {
  TwoFAMedium,
  UserSettingsDocument,
} from '../user-settings/entities/user-setting.entity';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { Profile } from '../users/types/profile.types';
import { TwoFACodeDto } from './dto/twoFA-code.dto';
import { otpEmail } from '../../core/emails/mails/otpEmail';
import { ResendEmailOtpDto } from './dto/resend-email-otp.dto';
import { ResendPhoneOtpDto } from './dto/resend-phone-otp.dto';
import { AppleAuth } from './strategies/appleAuth.strategy';
import { AppleLoginDto } from './dto/apple-login.dto';
import { JwtPayload } from '../lifeguards/types/jwt-payload.types';
import { ChangePhoneNumberDto } from './dto/change-phone-number.dto';
import { ChangeEmailAddressDto } from './dto/change-email-address.dto';
import { VerifyPhoneNumberChangeDto } from './dto/verify-phone-number-change.dto';
import { VerifyEmailChangeDto } from './dto/verify-email-change.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly tokensService: TokensService,
    private readonly generalHelpers: GeneralHelpers,
    private readonly googleAuth: GoogleAuth,
    private readonly userSettingService: UserSettingsService,
    private readonly twilio: Twilio,
    private readonly appleAuth: AppleAuth,
  ) {}

  async validateUserByEmail(
    email: string,
    pass: string,
  ): Promise<IJwtPayload | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && !user?.profile?.password) {
      throw new BadRequestException(Messages.SOCIAL_MEDIA_LOGIN);
    }
    const isValidPassword = await this.comparePassword(
      pass,
      user?.profile?.password,
    );
    if (user && isValidPassword) {
      return AuthService.formatJwtPayload(user);
    }
    return null;
  }

  async login(user: IJwtPayload) {
    const setting = await this.userSettingService.findOne(user.sub);
    if (setting.defaults?.twoFA_auth) {
      return await this.twoFactorAuthAuthentication(
        setting.defaults.twoFA_medium,
        user.sub,
      );
    }
    const token = await this.generateToken(user);
    return { message: Messages.USER_AUTHENTICATED, result: token };
  }

  async googleAltLogin(token: string, user_type: UserType) {
    const data = await this.decodeGoogleData(token);
    if (!data.email) throw new BadRequestException(Messages.NO_GOOGLE_USER);
    return this.socialMediaLogin({
      ...data,
      reg_medium: RegMedium.GOOGLE,
      is_email_verified: true,
      email_verified_at: new Date(),
      user_type,
    });
  }

  async decodeGoogleData(token: string) {
    if (!token) throw new BadRequestException(Messages.UNAUTHORIZED);
    return await this.googleAuth.validate(token);
  }

  async decodeAppleData(appleLoginDto: AppleLoginDto) {
    if (!appleLoginDto) throw new BadRequestException(Messages.UNAUTHORIZED);
    const { data, user } = await this.appleAuth.validate(appleLoginDto);
    if (!data?.email) throw new BadRequestException(Messages.NO_APPLE_USER);

    if (user) {
      return {
        first_name: user.name.firstName,
        last_name: user?.name?.lastName,
        email: user?.email,
      };
    }
    return { email: data.email };
  }

  async appleLogin(appleLoginDto: AppleLoginDto) {
    const data = await this.decodeAppleData(appleLoginDto);
    return this.socialMediaLogin({
      ...data,
      reg_medium: RegMedium.APPLE,
      is_email_verified: true,
      email_verified_at: new Date(),
      user_type: appleLoginDto?.authorization?.state,
    });
  }

  async socialMediaLogin(loggedInUser: SocialMediaUserType) {
    const { email, user_type } = loggedInUser;

    let user = await this.usersService.findOneByEmail(email);

    if (user) {
      await this.isAuthorized(email, user_type);
    }

    if (!user) {
      user = await this.usersService.createSocialMediaUser(loggedInUser);
    }

    const payload = AuthService.formatJwtPayload(user);
    return await this.generateToken(payload);
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
    originUrl: string,
  ) {
    const user = await this.usersService.findOneByEmail(
      forgotPasswordDto.email,
    );
    if (!user) throw new NotFoundException(Messages.NO_USER_FOUND);

    const existingToken = await this.tokensService.findTokenByUserId(
      user._id,
      TokenType.FORGOT_PASSWORD,
    );
    if (existingToken) await this.tokensService.removeToken(existingToken.id);

    const token = await this.tokensService.create(
      TokenType.FORGOT_PASSWORD,
      user._id,
    );

    this.generalHelpers.generateEmailAndSend({
      email: user.profile.contact.email,
      subject: Messages.FORGOT_PASSWORD,
      emailBody: forgotPasswordEmail({
        firstname: user.profile.first_name,
        token: token.token,
        userId: user._id,
        baseUrl: originUrl,
      }),
    });
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<unknown> {
    const { password, userId, token } = resetPasswordDto;

    const passwordResetToken = await this.tokensService.findToken(token);
    if (!passwordResetToken)
      throw new BadRequestException(Messages.INVALID_EXPIRED_TOKEN);

    const user = await this.usersService.findById(
      <Types.ObjectId>(<unknown>userId),
    );
    if (!user) throw new NotFoundException(Messages.NO_USER_FOUND);

    const salt = await bcrypt.genSalt(10);
    user.profile.password = await bcrypt.hash(password, salt);
    await user.save();

    await this.tokensService.removeToken(passwordResetToken._id);

    this.generalHelpers.generateEmailAndSend({
      email: user.profile.contact.email,
      subject: Messages.PASSWORD_RESET,
      emailBody: passwordResetEmail(user.profile.first_name),
    });
    return true;
  }

  async verifyEmailOTP(email: string, token: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new NotFoundException(Messages.NO_USER_FOUND);

    const verified = await this.tokensService.verifyOTP(user._id, token);
    if (verified) {
      const payload = AuthService.formatJwtPayload(user);
      return await this.generateToken(payload);
    }
    throw new BadRequestException(Messages.INVALID_EXPIRED_TOKEN);
  }

  async verifyPhoneOTP(email: string, code: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new NotFoundException(Messages.NO_USER_FOUND);

    const response = await this.twilio.verifyPhoneVerification(
      `${user.profile.contact?.phone?.country_code}${user.profile.contact?.phone?.number}`,
      code,
    );
    if (response.data.status === APPROVED) {
      const payload = AuthService.formatJwtPayload(user);
      return await this.generateToken(payload);
    }
    throw new BadRequestException(Messages.INVALID_EXPIRED_CODE);
  }

  async verify2FACode(email: string, twoFACodeDto: TwoFACodeDto) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new NotFoundException(Messages.NO_USER_FOUND);

    const verified = await this.isTwoFactorAuthCodeValid(
      twoFACodeDto,
      user.profile,
    );
    if (verified) {
      const payload = AuthService.formatJwtPayload(user);
      return await this.generateToken(payload);
    }
    throw new BadRequestException(Messages.INVALID_AUTH_CODE);
  }

  async verifyEmail(userId: Types.ObjectId, token: string) {
    const user = await this.usersService.findById(userId);
    if (user && user?.is_email_verified)
      throw new BadRequestException(Messages.EMAIL_ALREADY_VERIFIED);

    const foundToken = await this.tokensService.findTokenByUserIdAndType(
      userId,
      token,
      TokenType.EMAIL,
    );
    if (!foundToken) throw new BadRequestException(Messages.INVALID_TOKEN);

    if (moment(foundToken.expires_in).isSameOrAfter(moment())) {
      // update user to verified
      await this.usersService.updateOne(userId, {
        is_email_verified: true,
        email_verified_at: Date.now(),
      });

      // delete the token
      await this.tokensService.removeToken(foundToken._id);
      return true;
    }
    //delete expired code
    await this.tokensService.removeToken(foundToken._id);
    throw new BadRequestException(Messages.INVALID_EXPIRED_TOKEN);
  }

  async verifyPhone(phone: string, code: string) {
    const user = await this.usersService.findOneByPhone(
      this.removeLeadingZero(phone),
    );
    if (!user) throw new NotFoundException(Messages.NO_USER_FOUND);

    const response = await this.twilio.verifyPhoneVerification(
      `${user.profile.contact.phone.country_code}${phone}`,
      code,
    );
    if (response.data.status === APPROVED) {
      // update user to verified
      await this.usersService.updateOne(user._id, {
        is_phone_verified: true,
        phone_verified_at: Date.now(),
      });
      return;
    }
    throw new BadRequestException(Messages.INVALID_EXPIRED_TOKEN);
  }

  async resendEmailToken(userId: Types.ObjectId, originUrl: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException(Messages.NO_USER_FOUND);

    const token = await this.tokensService.create(TokenType.EMAIL, user._id);
    const link = `${originUrl}/email-verification?token=${token}&userId=${userId}`;
    this.generalHelpers.generateEmailAndSend({
      email: user.profile.contact.email,
      subject: Messages.EMAIL_VERIFICATION,
      emailBody: verificationEmail({
        firstname: user.profile.first_name,
        link,
      }),
    });
  }

  async resendSMSToken(phoneTokenDto: PhoneTokenDto) {
    const { phone } = phoneTokenDto;
    const user = await this.usersService.findOneByPhone(
      this.removeLeadingZero(phone),
    );
    if (!user) throw new NotFoundException(Messages.NO_USER_FOUND);

    const phoneNumber = `${user.profile.contact.phone.country_code}${phone}`;
    return await this.twilio.sendPhoneVerificationCode(phoneNumber);
  }

  async generateTwoFactorAuthSecret(userId: Types.ObjectId) {
    const { profile } = await this.usersService.findById(userId);
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(
      profile.contact.email,
      <string>process.env.TWO_FA_APP_NAME,
      secret,
    );

    await this.usersService.updateOne(userId, {
      'profile.twoFA_secret': secret,
      is_auth_app_enabled: true,
    });
    return {
      secret,
      otpAuthUrl,
    };
  }

  async pipeQrCodeStream(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  async turnOn2FAAuthentication(
    twoFACodeDto: TwoFACodeDto,
    userId: Types.ObjectId,
  ) {
    const user = await this.usersService.findById(userId);
    const isCodeValid = await this.isTwoFactorAuthCodeValid(
      twoFACodeDto,
      user.profile,
    );

    if (!isCodeValid) throw new BadRequestException(Messages.INVALID_AUTH_CODE);

    await this.userSettingService.updateSetting(
      { 'defaults.twoFA_medium': TwoFAMedium.AUTH_APPS },
      userId,
    );
  }

  async resendEmailOTP(resendEmailOtpDto: ResendEmailOtpDto) {
    const user = await this.usersService.findOneByEmail(
      resendEmailOtpDto.email,
    );
    if (!user) throw new NotFoundException(Messages.NO_USER_FOUND);

    await this.send2FAEmailOTP(user.profile, user._id, null);
  }

  async resendPhoneOTP(resendPhoneOtpDto: ResendPhoneOtpDto) {
    const user = await this.usersService.findOneByEmail(
      resendPhoneOtpDto.email,
    );
    if (!user) throw new NotFoundException(Messages.NO_USER_FOUND);

    await this.send2FAPhoneOTP(user.profile, null);
  }

  async changePhoneNumber(
    userId: Types.ObjectId,
    changePhoneNumberDto: ChangePhoneNumberDto,
  ) {
    const user = await this.usersService.findById(userId);
    const { phone, country_code, answer } = changePhoneNumberDto;
    // check security question exists
    if (user?.security?.answer?.toLowerCase() === answer?.toLowerCase()) {
      // check number already exists
      const isExists = await this.usersService.findOneByPhone(phone);
      if (isExists) throw new BadRequestException(Messages.PHONE_NUMBER_EXISTS);

      const phoneNumber = `${country_code}${phone}`;
      await this.twilio.sendPhoneVerificationCode(phoneNumber);
    }
    throw new BadRequestException(Messages.INCORRECT_ANSWER);
  }

  async verifyPhoneNumberChange(
    userId: Types.ObjectId,
    verifyPhoneNumberChangeDto: VerifyPhoneNumberChangeDto,
  ) {
    const { phone, country_code, code } = verifyPhoneNumberChangeDto;
    const user = await this.usersService.findOneByPhone(
      this.removeLeadingZero(phone),
    );
    if (!user) throw new NotFoundException(Messages.NO_USER_FOUND);

    const response = await this.twilio.verifyPhoneVerification(
      `${country_code}${phone}`,
      code,
    );
    if (response.data.status === APPROVED) {
      // change phone number
      return await this.usersService.updateOne(userId, {
        'profile.contact.phone.country_code': country_code,
        'profile.contact.phone.number': phone,
      });
    }
    throw new BadRequestException(Messages.INVALID_EXPIRED_TOKEN);
  }

  async changeEmailAddress(
    userId: Types.ObjectId,
    changeEmailAddressDto: ChangeEmailAddressDto,
  ) {
    const user = await this.usersService.findById(userId);
    const { email, answer } = changeEmailAddressDto;
    // check security question exists
    if (user?.security?.answer?.toLowerCase() === answer?.toLowerCase()) {
      // check number already exists
      const isExists = await this.usersService.findOneByEmail(email);
      if (isExists) throw new BadRequestException(Messages.EMAIL_EXISTS);

      const otp = await this.tokensService.create(TokenType.EMAIL, userId);
      // send OTP to user email
      this.generalHelpers.generateEmailAndSend({
        email: user.profile.contact.email,
        subject: Messages.EMAIL_VERIFICATION,
        emailBody: otpEmail(user.profile.first_name, otp.token),
      });
    }
    throw new BadRequestException(Messages.INCORRECT_ANSWER);
  }

  async verifyEmailAddressChange(
    userId: Types.ObjectId,
    verifyEmailChangeDto: VerifyEmailChangeDto,
  ) {
    const { email, code } = verifyEmailChangeDto;
    const foundToken = await this.tokensService.findTokenByUserIdAndType(
      userId,
      code,
      TokenType.EMAIL,
    );
    if (!foundToken) throw new BadRequestException(Messages.INVALID_TOKEN);

    if (moment(foundToken.expires_in).isSameOrAfter(moment())) {
      // change email address
      await this.usersService.updateOne(userId, {
        'profile.contact.email': email,
      });

      // delete the token
      await this.tokensService.removeToken(foundToken._id);
      return true;
    }
    //delete expired code
    await this.tokensService.removeToken(foundToken._id);
    throw new BadRequestException(Messages.INVALID_EXPIRED_TOKEN);
  }

  private static formatJwtPayload(user: UserDocument): IJwtPayload {
    const { profile } = user;
    return {
      sub: user._id,
      email: profile.contact.email,
      first_name: profile.first_name,
      user_type: user.user_type,
      is_email_verified: user.is_email_verified,
      is_phone_verified: user.is_phone_verified,
    };
  }

  async comparePassword(
    enteredPassword: string,
    dbPassword: string | undefined,
  ) {
    return await bcrypt.compare(enteredPassword, <string>dbPassword);
  }

  async generateToken(
    payload: IJwtPayload | { sub: string; email: string } | JwtPayload,
  ) {
    return await this.jwtService.signAsync(payload);
  }

  private async twoFactorAuthAuthentication(
    twoFaMedium: TwoFAMedium | undefined,
    userId: Types.ObjectId,
  ) {
    const { profile, _id } = await this.usersService.findById(userId);
    const setting = await this.userSettingService.findOne(userId);

    switch (twoFaMedium) {
      case TwoFAMedium.EMAIL:
        return await this.send2FAEmailOTP(profile, _id, setting);
      case TwoFAMedium.SMS:
        return await this.send2FAPhoneOTP(profile, setting);
      case TwoFAMedium.AUTH_APPS:
        return { message: Messages.TWOFA_OTP_SENT, result: setting };
      default:
        return await this.send2FAEmailOTP(profile, _id, setting);
    }
  }

  private async send2FAEmailOTP(
    profile: Profile,
    userId: Types.ObjectId,
    setting?: UserSettingsDocument | null,
  ) {
    const otp = await this.tokensService.create(TokenType.OTP, userId);
    // send OTP to user email
    this.generalHelpers.generateEmailAndSend({
      email: profile.contact.email,
      subject: Messages.LOGIN_VERIFICATION,
      emailBody: otpEmail(profile.first_name, otp.token),
    });
    return { message: Messages.EMAIL_OTP_SENT, result: setting };
  }

  private async send2FAPhoneOTP(
    profile: Profile,
    setting: UserSettingsDocument | null,
  ) {
    const phoneNumber = `${profile.contact.phone.country_code}${profile.contact.phone.number}`;
    await this.twilio.sendPhoneVerificationCode(phoneNumber);
    return { message: Messages.PHONE_OTP_SENT, result: setting };
  }

  private async isTwoFactorAuthCodeValid(
    twoFACodeDto: TwoFACodeDto,
    profile: Profile,
  ) {
    return authenticator.verify({
      token: twoFACodeDto.code,
      secret: <string>profile.twoFA_secret,
    });
  }

  private removeLeadingZero(phone: string) {
    if (phone.startsWith('0')) return phone.slice(1);
    return phone;
  }

  private async isAuthorized(email: string, user_type: UserType) {
    const user = await this.usersService.findOneByEmailAndUserType(
      email,
      user_type,
    );
    if (!user)
      throw new BadRequestException(Messages.APPROPRIATE_FORM_AUTHENTICATION);
    return user;
  }
}
