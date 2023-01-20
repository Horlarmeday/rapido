import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegMedium, UserDocument } from '../users/entities/user.entity';
import { IJwtPayload } from './types/jwt-payload.type';
import { JwtService } from '@nestjs/jwt';
import { Messages } from '../../core/messages/messages';
import { SocialMediaUserType } from './types/social-media.type';
import { TokensService } from '../tokens/tokens.service';
import { TokenType } from '../tokens/entities/token.entity';
import { MailService } from '../../core/emails/mail.service';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Types } from 'mongoose';
import { verificationEmail } from '../../core/emails/mails/verificationEmail';
import { forgotPasswordEmail } from '../../core/emails/mails/forgotPasswordEmail';
import { passwordResetEmail } from '../../core/emails/mails/passwordResetEmail';
import { GoogleAuth } from './strategies/googleAuth.strategy';
import { UserSettingsService } from '../user-settings/user-settings.service';
import { otpEmail } from '../../core/emails/mails/otpEmail';
import * as moment from 'moment';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly tokensService: TokensService,
    private readonly mailService: MailService,
    private readonly generalHelpers: GeneralHelpers,
    private readonly googleAuth: GoogleAuth,
    private readonly userSettingService: UserSettingsService,
  ) {}

  async validateUserByEmail(
    email: string,
    pass: string,
  ): Promise<IJwtPayload | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.reg_medium !== RegMedium.LOCAL)
      throw new BadRequestException(Messages.SOCIAL_MEDIA_LOGIN);

    if (
      user &&
      (await AuthService.comparePassword(pass, user.profile.password))
    )
      return AuthService.formatJwtPayload(user);
    return null;
  }

  async login(user: IJwtPayload) {
    const setting = await this.userSettingService.findOne(user.sub);
    if (setting.defaults.twoFA_auth) {
      // create OTP
      const otp = await this.tokensService.create(TokenType.OTP, user.sub);
      // send OTP to user email
      this.generalHelpers.generateEmailAndSend({
        email: user.email,
        subject: Messages.LOGIN_VERIFICATION,
        emailBody: otpEmail(user.first_name, otp.token),
      });
      return null;
    }
    const token = await this.generateToken(user);
    return { user, token };
  }

  async googleLogin(req) {
    if (!req.user) throw new BadRequestException(Messages.NO_GOOGLE_USER);
    return this.socialMediaLogin({
      ...req.user,
      reg_medium: RegMedium.GOOGLE,
      is_email_verified: true,
      email_verified_at: new Date(),
    });
  }

  async googleAltLogin(token: string) {
    const data = await this.decodeGoogleData(token);
    if (!data.email) throw new BadRequestException(Messages.NO_GOOGLE_USER);
    return this.socialMediaLogin({
      ...data,
      reg_medium: RegMedium.GOOGLE,
      is_email_verified: true,
      email_verified_at: new Date(),
    });
  }

  async decodeGoogleData(token: string) {
    if (!token) throw new BadRequestException(Messages.UNAUTHORIZED);
    return await this.googleAuth.validate(token);
  }

  async decodeAppleData(payload: any) {
    let user;
    if (!payload?.id_token)
      throw new BadRequestException(Messages.UNAUTHORIZED);

    if (payload.hasOwnProperty('id_token')) {
      if (payload.hasOwnProperty('user')) {
        const userData = JSON.parse(payload.user);
        user = {
          first_name: userData?.name.firstName,
          last_name: userData?.name?.lastName,
          email: userData?.email,
        };
        return user;
      }
      const decodedObj = await this.jwtService.decode(payload.id_token);
      return {
        email: decodedObj != null && decodedObj['email'],
      };
    }
    throw new BadRequestException(Messages.NO_APPLE_USER);
  }

  async appleLogin(req) {
    const data = await this.decodeAppleData(req);
    if (!data.email) throw new BadRequestException(Messages.NO_APPLE_USER);
    return this.socialMediaLogin({
      ...data,
      reg_medium: RegMedium.APPLE,
      is_email_verified: true,
      email_verified_at: new Date(),
    });
  }

  async socialMediaLogin(loggedInUser: SocialMediaUserType) {
    const { email } = loggedInUser;

    let user;
    user = await this.usersService.findOneByEmail(email);

    if (!user) {
      user = await this.usersService.createSocialMediaUser(loggedInUser);
    }
    const payload = AuthService.formatJwtPayload(user);
    const token = await this.generateToken(payload);
    return { payload, token };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findOneByEmail(
      forgotPasswordDto.email,
    );
    if (!user) throw new BadRequestException(Messages.NO_USER_FOUND);

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
      emailBody: forgotPasswordEmail(
        user.profile.first_name,
        token.token,
        user._id,
      ),
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
    if (!user) throw new BadRequestException(Messages.NO_USER_FOUND);

    user.profile.password = password;
    await user.save();

    await this.tokensService.removeToken(passwordResetToken._id);

    this.generalHelpers.generateEmailAndSend({
      email: user.profile.contact.email,
      subject: Messages.PASSWORD_RESET,
      emailBody: passwordResetEmail(user.profile.first_name),
    });
    return true;
  }

  async verifyOTP(email: string, token: string) {
    const user = await this.usersService.findOneByEmail(email);
    const verified = await this.tokensService.verifyOTP(user._id, token);
    if (verified) {
      const payload = AuthService.formatJwtPayload(user);
      return await this.generateToken(payload);
    }
    throw new BadRequestException(Messages.INVALID_EXPIRED_TOKEN);
  }
  async verifyEmailToken(userId: Types.ObjectId, token: string) {
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

  async verifyPhoneToken(userId: Types.ObjectId, token: string) {
    const userToken = await this.tokensService.findTokenByUserIdAndType(
      userId,
      token,
      TokenType.PHONE,
    );
    if (!userToken) throw new BadRequestException(Messages.INVALID_TOKEN);

    if (moment(userToken.expires_in).isSameOrAfter(moment())) {
      // update user to verified
      await this.usersService.updateOne(userId, {
        is_phone_verified: true,
        phone_verified_at: Date.now(),
      });

      // delete the token
      await this.tokensService.removeToken(userToken._id);
      return true;
    }
    //delete expired code
    await this.tokensService.removeToken(userToken._id);
    throw new BadRequestException(Messages.INVALID_EXPIRED_TOKEN);
  }

  async resendEmailToken(user: IJwtPayload) {
    const token = await this.tokensService.create(TokenType.EMAIL, user.sub);
    this.generalHelpers.generateEmailAndSend({
      email: user.email,
      subject: Messages.EMAIL_VERIFICATION,
      emailBody: verificationEmail(user.first_name, token.token, user.sub),
    });
  }

  async resendSMSToken(user: IJwtPayload) {
    const token = await this.tokensService.create(TokenType.PHONE, user.sub);
    // Todo: send sms to user phone
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

  private static async comparePassword(
    enteredPassword: string,
    dbPassword: string | undefined,
  ) {
    return bcrypt.compare(enteredPassword, <string>dbPassword);
  }

  private async generateToken(
    payload: IJwtPayload | { sub: string; email: string },
  ) {
    return await this.jwtService.signAsync(payload);
  }
}
