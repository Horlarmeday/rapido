import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { RegMedium, User, UserDocument } from './entities/user.entity';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as mime from 'mime-types';
import {
  countDocuments,
  create,
  deleteOne,
  findAndCountAll,
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
import { Condition, File } from './entities/pre-existing-condition.entity';
import { QueryDto } from '../../common/helpers/url-query.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
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
    const { country_code, phone, terms, marketing, email, password } =
      createUserDto;
    return await create(this.userModel, {
      profile: {
        ...createUserDto,
        password: await this.hashPassword(password),
        contact: {
          phone: {
            country_code,
            number: phone,
          },
          email,
        },
      },
      terms,
      marketing,
    });
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
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

  async register(createUserDto: CreateUserDto, originUrl: string) {
    //TODO: Wrap in transactions
    const user = await this.create(createUserDto);
    const token = await this.tokensService.create(TokenType.EMAIL, user._id);
    await this.userSettingsService.create(user._id);
    this.generalHelpers.generateEmailAndSend({
      email: user.profile.contact.email,
      subject: Messages.EMAIL_VERIFICATION,
      emailBody: verificationEmail({
        firstname: user.profile.first_name,
        token: token.token,
        userId: user._id,
        baseUrl: originUrl,
      }),
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

  async updateOne(userId: Types.ObjectId, fieldsToUpdate: object) {
    return await updateOne(this.userModel, { _id: userId }, fieldsToUpdate);
  }

  async profileSetup(userId: Types.ObjectId, profileSetupDto: ProfileSetupDto) {
    const { profile, reg_medium } = await this.findById(userId);
    const {
      profile: {
        contact: { address1, address2, country, zip_code, state, phone },
        profile_photo,
        basic_health_info,
        health_risk_factors,
        gender,
        marital_status,
      },
      emergency_contacts,
      pre_existing_conditions,
      dependants,
    } = profileSetupDto;

    const files =
      pre_existing_conditions
        ?.map(({ file }) => file)
        .filter((file) => file && file?.length) || [];

    const user = await updateOne(
      this.userModel,
      { _id: userId },
      {
        profile: {
          ...profile,
          basic_health_info,
          health_risk_factors,
          marital_status,
          gender,
          contact: {
            ...profile.contact,
            ...(reg_medium !== RegMedium.LOCAL && {
              phone: { country_code: phone.country_code, number: phone.number },
            }),
            address1,
            address2,
            country,
            zip_code,
            state,
          },
        },
        emergency_contacts,
        dependants,
        pre_existing_conditions:
          pre_existing_conditions?.map((condition) => ({
            ...condition,
            file:
              condition?.file?.map(({ file_type, original_name }) => ({
                file_type,
                original_name,
                url: '',
              })) || [],
          })) || [],
      },
    );
    if (profile_photo) {
      await this.taskCron.addCron(
        this.uploadProfilePhoto(userId, profile_photo),
        `${Date.now()}-${userId}-uploadProfilePhoto`,
      );
    }

    if (files?.length) {
      await this.hasFilesAndUpload(
        <File[][]>files,
        pre_existing_conditions,
        userId,
      );
    }
    return user;
  }

  async updateUserProfile(
    updateUserProfileDto: UpdateUserProfileDto,
    userId: Types.ObjectId,
  ) {
    const user = await this.findById(userId);
    return await updateOne(
      this.userModel,
      { _id: userId },
      {
        ...user,
        ...updateUserProfileDto,
      },
    );
  }

  async getUsers(query: QueryDto) {
    const { currentPage, pageLimit, filterBy } = query;
    const { limit, offset } = this.generalHelpers.calcLimitAndOffset(
      +currentPage,
      pageLimit,
    );
    const users = await findAndCountAll(
      this.userModel,
      { ...(filterBy && { user_type: filterBy }) },
      limit,
      offset,
      ['-profile.password', '-profile.twoFA_secret'],
    );
    return this.generalHelpers.paginate(
      users,
      +currentPage,
      limit,
      await countDocuments(this.userModel, { user_type: filterBy }),
    );
  }

  private async hasFilesAndUpload(
    files: File[][],
    pre_existing_conditions: Condition[] | undefined,
    userId: Types.ObjectId,
  ) {
    if (!files || !files?.length) return;
    if (!pre_existing_conditions || !pre_existing_conditions?.length) return;
    await this.taskCron.addCron(
      this.uploadProfileFiles(files, userId),
      `${Date.now()}-${userId}-uploadFiles`,
    );
  }

  async getProfile(userId: Types.ObjectId) {
    const user = await findOne(this.userModel, { _id: userId }, [
      '-profile.password',
      '-profile.twoFA_secret',
    ]);
    if (!user) throw new NotFoundException(Messages.NO_USER_FOUND);
    return user;
  }

  private static excludeFields(user: UserDocument) {
    const serializedUser = user.toJSON() as Partial<User>;
    delete serializedUser.profile?.password;
    delete serializedUser.profile?.twoFA_secret;
    return serializedUser;
  }

  private async uploadProfileFiles(files: File[][], userId: Types.ObjectId) {
    try {
      const user = await this.findById(userId);
      files.map((file) => {
        file.map(async ({ url, original_name: fileName }) => {
          const matches = url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches?.length !== 3)
            throw new BadRequestException(Messages.INVALID_BASE64);

          const buffer = Buffer.from(matches[2], 'base64');
          const extension = mime.extension(matches[1]);
          const s3Url = await this.fileUpload.uploadToS3(
            buffer,
            `${userId}-document.${extension}`,
          );
          user.pre_existing_conditions?.map(async ({ file }) => {
            const foundFile = file.find(
              ({ original_name }) => original_name === fileName,
            );
            if (foundFile) {
              foundFile.url = s3Url;
              await user.save();
            }
          });
        });
      });
      this.logger.log(`Updated user profile`);
    } catch (e) {
      this.logger.error(`Error uploading files occurred, ${e}`);
      throw new InternalServerErrorException('Error occurred', e);
    }
  }

  private async uploadProfilePhoto(userId: Types.ObjectId, base64: string) {
    try {
      const buffer = Buffer.from(base64, 'base64');
      this.logger.log('Uploading profile photo to S3 bucket');
      const promises = await Promise.all([
        this.fileUpload.uploadToS3(buffer, `${userId}-profilePhoto.jpg`),
      ]);
      this.logger.log(`Finished uploading profile photo to S3: ${promises}`);
      const user = await this.findById(userId);
      user.profile.profile_photo = promises[0];
      await user.save();
      this.logger.log(`Updated user profile photo`);
    } catch (e) {
      this.logger.error(`Error occurred uploading profile photo, ${e}`);
      throw new InternalServerErrorException('Error', e);
    }
  }
}
