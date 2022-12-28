import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { RegMedium, User, UserDocument } from '../users/entities/user.entity';
import { IJwtPayload } from './types/jwt-payload.type';
import { JwtService } from '@nestjs/jwt';
import { Messages } from '../../core/messages/messages';
import { SocialMediaUserType } from './types/social-media.type';
import { TokensService } from '../tokens/tokens.service';
import { TokenType } from '../tokens/entities/token.entity';
import { verificationEmail } from '../../core/emails/mails/verificationEmail';
import { MailService } from '../../core/emails/mail.service';
import { GeneralHelpers } from '../../common/helpers/general.helpers';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokensService: TokensService,
    private readonly mailService: MailService,
    private readonly generalHelpers: GeneralHelpers,
  ) {}

  async register(createUserDto: CreateUserDto) {
    //TODO: Wrap in transactions
    const user = await this.usersService.create(createUserDto);
    const token = await this.tokensService.create(TokenType.EMAIL, user._id);
    this.generalHelpers.generateEmailAndSend(
      user,
      token.token,
      Messages.EMAIL_VERIFICATION,
    );
    return AuthService.excludeFields(user);
  }

  async validateUserByEmail(
    email: string,
    pass: string,
  ): Promise<IJwtPayload | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.reg_medium !== RegMedium.LOCAL)
      throw new BadRequestException(Messages.SOCIAL_MEDIA_LOGIN);

    if (user && (await AuthService.comparePassword(pass, user.password)))
      return AuthService.formatJwtPayload(user);
    return null;
  }

  async login(user: IJwtPayload) {
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
    if (!req.email) throw new BadRequestException(Messages.NO_APPLE_USER);
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

  private static excludeFields(user: UserDocument) {
    const serializedUser = user.toJSON() as Partial<User>;
    delete serializedUser.password;
    return serializedUser;
  }

  private static formatJwtPayload(user: UserDocument): IJwtPayload {
    return {
      sub: user._id,
      email: user.email,
      first_name: user.first_name,
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

  // generateEmailAndSend(user, token) {
  //   const { _id, email, first_name } = user;
  //   // Get email body
  //   const emailBody = verificationEmail(first_name, token, _id);
  //   // Send email
  //   this.mailService.sendMail(email, Messages.EMAIL_VERIFICATION, emailBody);
  // }
}
