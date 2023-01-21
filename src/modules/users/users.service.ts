import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model, Types } from 'mongoose';
import {
  create,
  deleteOne,
  findById,
  findOne,
  updateOne,
} from '../../common/crud/crud';
import { SocialMediaUserType } from '../auth/types/social-media.type';
import { ProfileSetupDto } from './dto/profile-setup.dto';
import { FileUploadHelper } from '../../common/helpers/file-upload.helpers';
import { Messages } from '../../core/messages/messages';
import { TokenType } from '../tokens/entities/token.entity';
import { TokensService } from '../tokens/tokens.service';
import { verificationEmail } from '../../core/emails/mails/verificationEmail';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { UserSettingsService } from '../user-settings/user-settings.service';
import { TaskScheduler } from '../../core/worker/task.scheduler';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly fileUpload: FileUploadHelper,
    private readonly generalHelpers: GeneralHelpers,
    private tokensService: TokensService,
    private userSettingsService: UserSettingsService,
    private taskCron: TaskScheduler,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    return await create(this.userModel, {
      profile: {
        ...createUserDto,
        contact: {
          phone: {
            country_code: createUserDto?.country_code,
            number: createUserDto?.phone,
          },
          email: createUserDto.email,
        },
      },
    });
  }

  async createSocialMediaUser(
    socialMediaUserType: SocialMediaUserType,
  ): Promise<UserDocument> {
    return await create(this.userModel, {
      profile: {
        ...socialMediaUserType,
        contact: {
          email: socialMediaUserType.email,
        },
      },
      reg_medium: socialMediaUserType.reg_medium,
      is_email_verified: socialMediaUserType.is_email_verified,
      email_verified_at: socialMediaUserType.email_verified_at,
    });
  }

  async register(createUserDto: CreateUserDto) {
    //TODO: Wrap in transactions
    const user = await this.create(createUserDto);
    const token = await this.tokensService.create(TokenType.EMAIL, user._id);
    await this.userSettingsService.create(user._id);
    this.generalHelpers.generateEmailAndSend({
      email: user.profile.contact.email,
      subject: Messages.EMAIL_VERIFICATION,
      emailBody: verificationEmail(
        user.profile.first_name,
        token.token,
        user._id,
      ),
    });
    return UsersService.excludeFields(user);
  }

  async findById(id: Types.ObjectId): Promise<UserDocument> {
    return await findById(this.userModel, id);
  }

  async findOneByEmail(email: string): Promise<UserDocument> {
    return await findOne(this.userModel, { 'profile.contact.email': email });
  }

  async findOneByPhone(phone: string): Promise<UserDocument> {
    return await findOne(this.userModel, {
      'profile.contact.phone.number': phone,
    });
  }

  async findOneByEmailOrPhone(email: string, phone: string): Promise<User> {
    return await findOne(this.userModel, {
      $or: [
        {
          'profile.contact.email': email || '',
        },
        {
          'profile.contact.phone.number': phone || '',
        },
      ],
    });
  }

  async removeOne(id: string) {
    return await deleteOne(this.userModel, { _id: id });
  }

  async updateOne(userId: Types.ObjectId, fieldsToUpdate: any) {
    return this.userModel.updateOne({ _id: userId }, { $set: fieldsToUpdate });
  }

  async profileSetup(
    userId: Types.ObjectId,
    profileSetupDto: ProfileSetupDto,
    files: Express.Multer.File[],
  ) {
    const { profile } = await this.findById(userId);
    const {
      address1,
      address2,
      country,
      zip_code,
      state,
      emergency_contacts,
      pre_existing_conditions,
      dependants,
    } = profileSetupDto;

    const user = await updateOne(
      this.userModel,
      { _id: userId },
      {
        profile: {
          ...profile,
          ...profileSetupDto,
          contact: {
            ...profile.contact,
            address1,
            address2,
            country,
            zip_code,
            state,
          },
        },
        emergency_contacts,
        dependants,
        pre_existing_conditions,
      },
    );
    await this.hasFilesAndUpload(files, pre_existing_conditions, userId);
    return user;
  }

  private async hasFilesAndUpload(
    files: Express.Multer.File[],
    pre_existing_conditions: string | any[],
    userId: Types.ObjectId,
  ) {
    if (!files.length) return;
    if (!pre_existing_conditions?.length) return;
    await this.taskCron.addCron(
      this.uploadToS3(files, userId),
      `${userId}-uploadS3`,
    );
  }

  async getProfile(userId: Types.ObjectId) {
    const user = await findOne(
      this.userModel,
      { _id: userId },
      '-profile.password',
    );
    if (!user) throw new BadRequestException(Messages.NO_USER_FOUND);
    return user;
  }

  private static excludeFields(user: UserDocument) {
    const serializedUser = user.toJSON() as Partial<User>;
    delete serializedUser.profile?.password;
    delete serializedUser.profile?.twoFA_secret;
    return serializedUser;
  }

  async uploadToS3(files, userId) {
    try {
      this.logger.log('Uploading to S3 bucket');
      const promises = await Promise.all(
        files.map((file) => {
          return this.fileUpload.uploadToS3(file.buffer, file.originalname);
        }),
      );
      this.logger.log(`Finished updating to S3: ${promises}`);
      const user = await this.findById(userId);
      user.pre_existing_conditions?.map((condition, index) => {
        condition.file = promises[index];
      });
      await user.save();
      this.logger.log(`Updated user profile`);
    } catch (e) {
      this.logger.error(`Error occurred, ${e}`);
      throw new InternalServerErrorException('Error occurred', e);
    }
  }
}
