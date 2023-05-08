import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLifeguardDto } from './dto/create-lifeguard.dto';
import {
  create,
  findById,
  findOne,
  updateOne,
  updateOneAndReturn,
  upsert,
} from '../../common/crud/crud';
import { InjectModel } from '@nestjs/mongoose';
import { Lifeguard, LifeguardDocument } from './entities/lifeguard.entity';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { JwtPayload } from './types/jwt-payload.types';
import { Messages } from '../../core/messages/messages';
import { LifeguardLoginDto } from './dto/lifeguard-login.dto';
import { RegMedium } from '../users/entities/user.entity';
import { SetPreferencesDto } from './dto/set-preferences.dto';
import { SocialMediaCreate } from './types/lifeguard.types';
import { AppleLoginDto } from '../auth/dto/apple-login.dto';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { PaymentLog, PaymentLogDocument } from './entities/payment-logs.entity';
import { PaymentHandler } from '../../common/external/payment/payment.handler';
import { FAILED, PENDING, SUCCESS } from '../../core/constants';
import { PaymentProvider } from '../admin-settings/types/admin-settings.types';
import { CardDetailsType } from '../../common/external/payment/providers/paystack';
import { Status } from '../payments/entities/payment.entity';
import * as moment from 'moment';
import { otpEmail } from '../../core/emails/mails/otpEmail';
import { ResendEmailOtpDto } from '../auth/dto/resend-email-otp.dto';
import { IJwtPayload } from '../auth/types/jwt-payload.type';
import { JwtService } from '@nestjs/jwt';
import * as process from 'process';

@Injectable()
export class LifeguardsService {
  constructor(
    @InjectModel(Lifeguard.name)
    private lifeguardModel: Model<LifeguardDocument>,
    @InjectModel(PaymentLog.name)
    private paymentLogModel: Model<PaymentLogDocument>,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly generalHelpers: GeneralHelpers,
    private readonly paymentHandler: PaymentHandler,
    private readonly jwtService: JwtService,
  ) {}

  private async insertToDB(fieldsToCreate: any): Promise<LifeguardDocument> {
    return await create(this.lifeguardModel, {
      ...fieldsToCreate,
    });
  }
  async localRegistration(createLifeguardDto: CreateLifeguardDto) {
    const lifeguard = await this.insertToDB({
      ...createLifeguardDto,
      password: await this.usersService.hashPassword(
        createLifeguardDto.password,
      ),
      regMedium: RegMedium.LOCAL,
      token: {
        code: this.generalHelpers.generateRandomNumbers(6),
      },
      phone: {
        country_code: createLifeguardDto.country_code,
        number: createLifeguardDto.phone,
      },
    });
    this.generalHelpers.generateEmailAndSend({
      email: lifeguard.email,
      subject: Messages.EMAIL_VERIFICATION,
      emailBody: otpEmail(lifeguard.first_name, lifeguard.token.code),
    });
    return LifeguardsService.excludeFields(lifeguard);
  }

  async resendEmailToken(resendEmailOtpDto: ResendEmailOtpDto) {
    const lifeguard = await this.findOneByEmail(resendEmailOtpDto.email);
    const token = await updateOneAndReturn(
      this.lifeguardModel,
      { _id: lifeguard._id },
      {
        token: {
          code: this.generalHelpers.generateRandomNumbers(6),
          expiration: moment().add(4, 'hour').toDate(),
        },
      },
    );
    this.generalHelpers.generateEmailAndSend({
      email: lifeguard.email,
      subject: Messages.EMAIL_VERIFICATION,
      emailBody: otpEmail(lifeguard.first_name, token.token.code),
    });
  }

  async verifyEmail(email: string, code: string) {
    const lifeguard = await this.findOneByEmail(email);
    if (!lifeguard) throw new NotFoundException(Messages.NO_USER_FOUND);
    const isOtpValid = lifeguard.token.code === code;
    if (
      isOtpValid &&
      moment(lifeguard.token.expiration).isSameOrAfter(moment())
    ) {
      return await updateOne(
        this.lifeguardModel,
        { _id: lifeguard._id },
        { token: null, is_email_verified: true, email_verified_at: new Date() },
      );
    }
    throw new BadRequestException(Messages.INVALID_EXPIRED_CODE);
  }

  async socialMediaRegister(fieldsToInsert: SocialMediaCreate) {
    const { email } = fieldsToInsert;
    let lifeguard = await this.findOneByEmail(email);
    if (!lifeguard) {
      lifeguard = await this.insertToDB(fieldsToInsert);
    }
    const payload = LifeguardsService.formatJwtPayload(lifeguard);
    return this.generateToken(payload);
  }

  async validateLifeguard(email: string, passwrd: string) {
    const lifeguard = await this.findOneByEmail(email);
    if (lifeguard && !lifeguard?.password) {
      throw new BadRequestException(Messages.SOCIAL_MEDIA_LOGIN);
    }
    const isValid = await this.authService.comparePassword(
      passwrd,
      lifeguard?.password,
    );
    if (lifeguard && isValid) {
      return LifeguardsService.formatJwtPayload(lifeguard);
    }
    throw new BadRequestException(Messages.INVALID_CREDENTIALS);
  }

  async generateToken(
    payload: IJwtPayload | { sub: string; email: string } | JwtPayload,
  ) {
    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWTKEY,
      expiresIn: process.env.TOKEN_EXPIRATION,
    });
  }

  async login(lifeguardLoginDto: LifeguardLoginDto) {
    const { email, password } = lifeguardLoginDto;
    const payload = await this.validateLifeguard(email, password);
    return this.generateToken(payload);
  }

  async googleLogin(token: string) {
    const data = await this.authService.decodeGoogleData(token);
    if (!data.email) throw new BadRequestException(Messages.NO_GOOGLE_USER);
    return await this.socialMediaRegister({
      ...data,
      reg_medium: RegMedium.GOOGLE,
      is_email_verified: true,
      email_verified_at: new Date(),
    });
  }

  async appleLogin(appleLoginDto: AppleLoginDto) {
    const data = await this.authService.decodeAppleData(appleLoginDto);
    return await this.socialMediaRegister({
      ...data,
      reg_medium: RegMedium.APPLE,
      is_email_verified: true,
      email_verified_at: new Date(),
    });
  }

  async findOneByEmail(email: string): Promise<LifeguardDocument> {
    return findOne(this.lifeguardModel, { email });
  }

  async findOneById(lifeguardId: Types.ObjectId): Promise<LifeguardDocument> {
    const lifeguard = await findById(this.lifeguardModel, lifeguardId);
    if (!lifeguard) throw new NotFoundException(Messages.NO_USER_FOUND);
    return lifeguard;
  }

  async findOneByEmailOrPhone(
    email: string,
    phone: string,
  ): Promise<LifeguardDocument> {
    return await findOne(this.lifeguardModel, {
      $or: [
        {
          email: email || '',
        },
        {
          'phone.number': phone || '',
        },
      ],
    });
  }

  async setPreference(
    lifeguardId: Types.ObjectId,
    setPreferencesDto: SetPreferencesDto,
  ) {
    const lifeguard = await this.findOneById(lifeguardId);
    const reference = this.generalHelpers.genTxReference();
    const card = lifeguard.card_details?.find(
      ({ _id }) => _id === setPreferencesDto.cardId,
    );
    if (!card) throw new BadRequestException(Messages.CARD_NOT_FOUND);
    const response = await this.paymentHandler.tokenizedCharge({
      email: lifeguard.email,
      amount: setPreferencesDto.amount_donated,
      reference,
      token: card.auth_code,
      currency: 'NGN',
    });
    if (response.status === SUCCESS) {
      await upsert(
        this.lifeguardModel,
        { _id: lifeguard._id },
        { $push: { preferences: setPreferencesDto } },
      );
      await create(this.paymentLogModel, {
        reference,
        lifeguardId,
        status: Status.SUCCESSFUL,
        amount: setPreferencesDto.amount_donated,
      });
      return this.getPaymentByReference(reference);
    }
    throw new BadRequestException();
  }

  async getLifeguardProfile(lifeguardId: Types.ObjectId) {
    const lifeguard = await findOne(
      this.lifeguardModel,
      { _id: lifeguardId },
      { selectFields: '-password' },
    );
    if (!lifeguard) throw new NotFoundException(Messages.NO_USER_FOUND);
    return lifeguard;
  }

  async updatePayment(reference: string, fieldsToUpdate) {
    return await updateOne(
      this.paymentLogModel,
      { reference },
      { ...fieldsToUpdate },
    );
  }

  async getPaymentByReference(reference: string) {
    const payment = await findOne(this.paymentLogModel, { reference });
    if (!payment) throw new NotFoundException(Messages.PAYMENT_NOT_FOUND);
    return payment;
  }

  async beginAddPaymentMethod(lifeguard: JwtPayload) {
    const reference = this.generalHelpers.genTxReference();
    const amount = 50;
    return await create(this.paymentLogModel, {
      reference,
      lifeguardId: lifeguard.sub,
      amount,
    });
  }

  async saveCardDetails(
    cardDetails: CardDetailsType,
    lifeguardId: Types.ObjectId,
  ) {
    const card = this.generalHelpers.formatCardDetails(
      cardDetails,
      PaymentProvider.PAYSTACK,
    );
    await upsert(
      this.lifeguardModel,
      { _id: lifeguardId },
      { $push: { card_details: card } },
    );
  }

  async finishAddPaymentMethod(reference: string, lifeguardId: Types.ObjectId) {
    const response = await this.paymentHandler.verifyTransaction(reference);
    switch (response?.data?.status) {
      case SUCCESS:
        await Promise.all([
          this.updatePayment(reference, {
            status: Status.SUCCESSFUL,
            amount: response.data?.amount / 100,
          }),
          response.data?.authorization?.reusable
            ? this.saveCardDetails(response.data.authorization, lifeguardId)
            : [],
        ]);
        return this.getPaymentByReference(reference);
      case FAILED:
        await this.updatePayment(reference, {
          status: Status.FAILED,
          amount: +response.data?.amount / 100,
        });
        return this.getPaymentByReference(reference);
      case PENDING:
        return this.getPaymentByReference(reference);
      default:
        return this.getPaymentByReference(reference);
    }
  }

  private static excludeFields(lifeguard: LifeguardDocument) {
    const serializedUser = lifeguard.toJSON() as Partial<Lifeguard>;
    delete serializedUser?.password;
    delete serializedUser?.token;
    return serializedUser;
  }

  private static formatJwtPayload(
    lifeguard: LifeguardDocument,
  ): JwtPayload | IJwtPayload {
    const { _id, email, first_name, is_email_verified } = lifeguard;
    return {
      sub: _id,
      email,
      first_name,
      is_email_verified,
      user_type: 'Lifeguard',
    };
  }
}
