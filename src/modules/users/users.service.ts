import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  RegMedium,
  User,
  UserDocument,
  UserType,
} from './entities/user.entity';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as mime from 'mime-types';
import {
  countDocuments,
  create,
  deleteOne,
  find,
  findAndCountAll,
  findById,
  findOne,
  updateOne,
  upsert,
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
import { File } from './entities/pre-existing-condition.entity';
import { QueryDto } from '../../common/helpers/url-query.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ProfessionalPracticeSetupDto } from './dto/professional-practice-setup.dto';
import { Documents } from './types/profile.types';
import { IJwtPayload } from '../auth/types/jwt-payload.type';
import { SpecialistAvailabilityDto } from './dto/specialist-availability.dto';
import {
  SpecialistPreferences,
  SpecialistPreferencesDocument,
} from './entities/specialist-preferences.entity';
import { SpecialistPreferencesDto } from './dto/specialist-preferences.dto';
import { CreateAwardDto } from './dto/create-award.dto';
import { CreateCertificationsDto } from './dto/create-certifications.dto';
import { ReferralsService } from '../referrals/referrals.service';
import { WalletsService } from '../wallets/wallets.service';

const { ObjectId } = Types;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(SpecialistPreferences.name)
    private specialistPreferencesModel: Model<SpecialistPreferencesDocument>,
    private readonly fileUpload: FileUploadHelper,
    private readonly generalHelpers: GeneralHelpers,
    private readonly tokensService: TokensService,
    private readonly userSettingsService: UserSettingsService,
    private readonly referralsService: ReferralsService,
    private taskCron: TaskScheduler,
    private readonly walletsService: WalletsService,
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
      ...createUserDto,
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
      ...socialMediaUserType,
    });
  }

  async register(createUserDto: CreateUserDto, originUrl: string) {
    //TODO: Wrap in transactions
    const user = await this.create(createUserDto);
    const token = await this.tokensService.create(TokenType.EMAIL, user._id);
    await this.userSettingsService.create(user._id);
    await this.referralsService.createReferral(user._id);
    const link = `${
      originUrl || process.env.BASE_URL
    }/email-verification?token=${token.token}&userId=${user._id}`;
    this.generalHelpers.generateEmailAndSend({
      email: user.profile.contact.email,
      subject: Messages.EMAIL_VERIFICATION,
      emailBody: verificationEmail({
        firstname: user.profile.first_name,
        link,
      }),
    });
    return UsersService.excludeFields(user);
  }

  async findById(id: Types.ObjectId): Promise<UserDocument> {
    return await findById(this.userModel, id);
  }

  async findOne(query: any): Promise<UserDocument> {
    const user = await findOne(this.userModel, query, {
      selectFields: ['-profile.password', '-profile.twoFA_secret', '-security'],
    });
    if (!user) throw new NotFoundException(Messages.NO_USER_FOUND);
    return user;
  }

  async findOneByEmail(email: string): Promise<UserDocument> {
    return await findOne(this.userModel, { 'profile.contact.email': email });
  }

  async findOneByEmailAndUserType(
    email: string,
    user_type: UserType,
  ): Promise<UserDocument> {
    return await findOne(this.userModel, {
      'profile.contact.email': email,
      user_type,
    });
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
      security,
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
        security,
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
        this.uploadProfileFiles(files, userId, 'pre_existing_conditions'),
        `${Date.now()}-${userId}-uploadFiles`,
      );
    }
    return user;
  }

  mapContacts(dbEmergencyContacts, emergency_contacts) {
    const idMap = new Map(
      emergency_contacts.map((fContact) => [fContact._id, fContact]),
    );

    const updatedEmergencyContacts: any = [];

    const mappedEmergencyContacts = dbEmergencyContacts?.map((contact) => {
      const foundContact = idMap.get(contact._id.toString());
      if (foundContact) return { ...contact, ...foundContact };
      return contact;
    });

    emergency_contacts?.forEach((contact) => {
      if (!contact._id) {
        updatedEmergencyContacts.push({ ...contact, _id: new ObjectId() });
      }
    });

    return updatedEmergencyContacts.length
      ? [...mappedEmergencyContacts, ...updatedEmergencyContacts]
      : mappedEmergencyContacts;
  }

  mapDependants(dbDependants, dependants) {
    const idMap = new Map(
      dependants.map((fDependant) => [fDependant._id, fDependant]),
    );

    const updatedDependants: any = [];

    const mappedDependants = dbDependants?.map((dependant) => {
      const foundCondition = idMap.get(dependant._id.toString());
      if (foundCondition) return { ...dependant, ...foundCondition };
      return dependant;
    });

    dependants?.forEach((dependant) => {
      if (!dependant._id) {
        updatedDependants.push({ ...dependant, _id: new ObjectId() });
      }
    });

    return updatedDependants.length
      ? [...mappedDependants, ...updatedDependants]
      : mappedDependants;
  }

  async mapPreConditions(dbPreConditions, pre_existing_conditions, userId) {
    const idMap = new Map(
      pre_existing_conditions.map((cond) => [cond._id, cond]),
    );
    const updatedConditions: any = [];
    const files: any = [];

    const mappedConditions = dbPreConditions?.map((cond) => {
      const foundCondition = idMap.get(cond._id.toString());
      if (foundCondition) return { ...cond, ...foundCondition };
      return cond;
    });

    pre_existing_conditions?.forEach((cond) => {
      if (!cond._id) {
        updatedConditions.push({ ...cond, _id: new ObjectId() });
        if (cond.file?.length) files.push(cond.file);
      }
    });

    if (files.length) {
      await this.hasFilesAndUpload(
        files,
        pre_existing_conditions,
        this.uploadProfileFiles(files, userId, 'pre_existing_conditions'),
        `${Date.now()}-${userId}-uploadFiles`,
      );
    }

    return updatedConditions.length
      ? [...mappedConditions, ...updatedConditions]
      : mappedConditions;
  }

  async updateUserProfile(
    updateUserProfileDto: UpdateUserProfileDto,
    userId: Types.ObjectId,
  ) {
    const {
      profile,
      pre_existing_conditions,
      dependants,
      emergency_contacts,
      security,
    } = updateUserProfileDto || {};

    const user = await this.findById(userId);
    const {
      profile: dbUser,
      security: dbSecurity,
      pre_existing_conditions: dbPreConditions = [],
      dependants: dbDependants = [],
      emergency_contacts: dbEmergencyContacts = [],
    } = user.toJSON();

    const fieldsToUpdate = {
      profile: {
        ...dbUser,
        ...(profile?.contact && {
          contact: {
            ...dbUser.contact,
            ...profile.contact,
          },
        }),
        basic_health_info: {
          ...(dbUser.basic_health_info || {}),
          ...(profile?.basic_health_info || {}),
        },
        health_risk_factors: {
          ...(dbUser.health_risk_factors || {}),
          ...(profile?.health_risk_factors || {}),
        },
      },
      ...(security && {
        security: {
          ...(dbSecurity || {}),
          ...(security || {}),
        },
      }),
      ...(pre_existing_conditions?.length && {
        pre_existing_conditions: await this.mapPreConditions(
          dbPreConditions,
          pre_existing_conditions,
          userId,
        ),
      }),
      ...(dependants?.length && {
        dependants: this.mapDependants(dbDependants, dependants),
      }),
      ...(emergency_contacts?.length && {
        emergency_contacts: this.mapContacts(
          dbEmergencyContacts,
          emergency_contacts,
        ),
      }),
    };

    if (profile?.profile_photo) {
      await this.taskCron.addCron(
        this.uploadProfilePhoto(userId, profile.profile_photo),
        `${Date.now()}-${userId}-uploadProfilePhoto`,
      );
    }

    return await updateOne(
      this.userModel,
      { _id: userId },
      {
        ...fieldsToUpdate,
      },
    );
  }

  async findAllUsers(query, fieldsToSelect: string | string[] | null = null) {
    return (await find(
      this.userModel,
      { ...query },
      {
        ...(fieldsToSelect
          ? {
              selectFields:
                typeof fieldsToSelect === 'string'
                  ? fieldsToSelect
                  : [...fieldsToSelect],
            }
          : {}),
      },
    )) as UserDocument[];
  }

  async getUsers(query: QueryDto) {
    const { currentPage, pageLimit, filterBy, search } = query;
    const { limit, offset } = this.generalHelpers.calcLimitAndOffset(
      +currentPage,
      pageLimit,
    );
    let result: { users: UserDocument[]; count: number };

    if (search) {
      result = await this.searchUsers(filterBy, limit, offset, search);
    } else {
      result = await this.queryUsers(filterBy, limit, offset);
    }

    return this.generalHelpers.paginate(
      result.users,
      +currentPage,
      limit,
      result.count,
    );
  }

  async searchUsers(
    filterBy: string | undefined,
    limit: number,
    offset: number,
    search: string,
  ): Promise<{ users: UserDocument[]; count: number }> {
    const query = {
      ...(filterBy && { user_type: filterBy }),
      $text: { $search: search },
    };
    const users = (await findAndCountAll({
      model: this.userModel,
      query,
      limit,
      offset,
      options: {
        selectFields: [
          '-profile.password',
          '-profile.twoFA_secret',
          '-security',
        ],
      },
      displayScore: true,
    })) as UserDocument[];
    return { users, count: await countDocuments(this.userModel, { ...query }) };
  }

  async queryUsers(
    filterBy: string | undefined,
    limit: number,
    offset: number,
  ): Promise<{ users: UserDocument[]; count: number }> {
    const query = { ...(filterBy && { user_type: filterBy }) };
    const users = (await findAndCountAll({
      model: this.userModel,
      query,
      limit,
      offset,
      options: {
        selectFields: [
          '-profile.password',
          '-profile.twoFA_secret',
          '-security',
        ],
      },
    })) as UserDocument[];
    return { users, count: await countDocuments(this.userModel, { ...query }) };
  }

  private async hasFilesAndUpload(
    files: File[][],
    fields: any[] | undefined,
    funcToRun,
    jobName,
  ) {
    if (!files || !files?.length) return;
    if (!fields || !fields?.length) return;
    await this.taskCron.addCron(funcToRun, jobName);
  }

  async getProfile(payload: IJwtPayload) {
    const user = await findOne(
      this.userModel,
      { _id: payload.sub },
      { selectFields: this.getSelectedFields(payload.user_type) },
    );
    if (!user) throw new NotFoundException(Messages.NO_USER_FOUND);
    return user;
  }

  getSelectedFields(user_type: UserType | string) {
    if (user_type === UserType.SPECIALIST) {
      return [
        '-profile.password',
        '-profile.twoFA_secret',
        '-emergency_contacts',
        '-pre_existing_conditions',
        '-dependants',
        '-security',
      ];
    }
    return [
      '-profile.password',
      '-profile.twoFA_secret',
      '-documents',
      '-professional_practice',
      '-earnings',
      '-average_rating',
      '-verification_status',
      '-awards',
      '-payment_structure',
      '-security',
    ];
  }

  async specialistProfileSetup(
    professionalPracticeSetupDto: ProfessionalPracticeSetupDto,
    userId: Types.ObjectId,
  ) {
    const user = await this.findById(userId);
    if (user.user_type !== UserType.SPECIALIST)
      throw new BadRequestException(Messages.UNAUTHORIZED);
    const {
      documents,
      professional_practice,
      payment_structure,
      profile: {
        contact: { phone, country, zip_code, state, address1, address2 },
        marital_status,
        profile_photo,
        gender,
      },
      security,
    } = professionalPracticeSetupDto;
    const { profile, reg_medium } = user.toJSON();

    const updatedUser = await updateOne(
      this.userModel,
      { _id: userId },
      {
        profile: {
          ...profile,
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
        professional_practice,
        payment_structure,
        security,
        documents:
          documents?.map(({ file_type, original_name, type_of_document }) => ({
            file_type,
            original_name,
            type_of_document,
            url: '',
          })) || [],
      },
    );
    if (profile_photo) {
      await this.taskCron.addCron(
        this.uploadProfilePhoto(userId, profile_photo),
        `${Date.now()}-${userId}-uploadProfilePhoto`,
      );
    }

    if (documents?.length) {
      await this.taskCron.addCron(
        this.uploadSpecialistDocuments(documents, user),
        `${Date.now()}-${userId}-uploadDocuments`,
      );
    }
    return updatedUser;
  }

  async addAward(createAwardDto: CreateAwardDto, userId: Types.ObjectId) {
    const { awards } = createAwardDto;
    const files =
      awards?.map(({ file }) => file).filter((file) => file && file?.length) ||
      [];

    const user = await updateOne(
      this.userModel,
      { _id: userId },
      {
        awards:
          awards?.map((condition) => ({
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
    if (files?.length) {
      await this.hasFilesAndUpload(
        files,
        awards,
        this.uploadProfileFiles(files, userId, 'awards'),
        `${Date.now()}-uploadAwards`,
      );
    }
    return user;
  }

  async addCertifications(
    createCertificationsDto: CreateCertificationsDto,
    userId: Types.ObjectId,
  ) {
    const { documents } = createCertificationsDto;
    const user = await this.findById(userId);
    const updatedUser = await updateOne(
      this.userModel,
      { _id: userId },
      {
        documents:
          documents?.map(({ file_type, original_name, type_of_document }) => ({
            file_type,
            original_name,
            type_of_document,
            url: '',
          })) || [],
      },
    );
    if (documents?.length) {
      await this.taskCron.addCron(
        this.uploadSpecialistDocuments(documents, user),
        `${Date.now()}-${user._id}-uploadDocuments`,
      );
    }
    return updatedUser;
  }

  private static excludeFields(user: UserDocument) {
    const serializedUser = user.toJSON() as Partial<User>;
    delete serializedUser.profile?.password;
    delete serializedUser.profile?.twoFA_secret;
    return serializedUser;
  }

  private async uploadProfileFiles(
    files: File[][],
    userId: Types.ObjectId,
    fieldToUpdate,
  ) {
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
          user[fieldToUpdate]?.map(async ({ file }) => {
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

  private async uploadSpecialistDocuments(
    documents: Documents[],
    user: UserDocument,
  ) {
    try {
      const promises = await Promise.all(
        documents.map(({ url, original_name }) => {
          this.logger.log(`Uploading ${original_name} document`);
          const matches = url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches?.length !== 3)
            throw new BadRequestException(Messages.INVALID_BASE64);

          const buffer = Buffer.from(matches[2], 'base64');
          const extension = mime.extension(matches[1]);
          return this.fileUpload.uploadToS3(
            buffer,
            `${user._id}-document.${extension}`,
          );
        }),
      );
      user.documents.map((doc, index) => {
        doc.url = promises[index];
      });
      await user.save();
      this.logger.log(`Saved ${user.full_name} professional documents`);
    } catch (e) {
      this.logger.error(`Error occurred uploading documents, ${e}`);
      throw new InternalServerErrorException(e);
    }
  }

  async removePreExistingCondition(
    conditionId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    return this.userModel.updateOne(
      { _id: userId },
      { $pull: { pre_existing_conditions: { _id: conditionId } } },
    );
  }

  async removeDependants(dependantId: Types.ObjectId, userId: Types.ObjectId) {
    return this.userModel.updateOne(
      { _id: userId },
      { $pull: { dependants: { _id: dependantId } } },
    );
  }

  async removeEmergencyContacts(
    emergencyContactId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    return this.userModel.updateOne(
      { _id: userId },
      { $pull: { emergency_contacts: { _id: emergencyContactId } } },
    );
  }

  async createTimeAvailability(
    userId: Types.ObjectId,
    specialistAvailabilityDto: SpecialistAvailabilityDto,
  ) {
    return await upsert(
      this.specialistPreferencesModel,
      { userId },
      { $set: { ...specialistAvailabilityDto } },
    );
  }

  async createPatientPreferences(
    userId: Types.ObjectId,
    specialistPreferencesDto: SpecialistPreferencesDto,
  ) {
    return await upsert(
      this.specialistPreferencesModel,
      { userId },
      { $set: { ...specialistPreferencesDto } },
    );
  }

  async getUserAvailabilityAndPreferences(userId: Types.ObjectId) {
    return await findOne(this.specialistPreferencesModel, { userId });
  }

  async getPreferences(query: any) {
    return (await find(this.specialistPreferencesModel, {
      ...query,
    })) as SpecialistPreferences[];
  }

  async getUserSecurityQuestion(userId: Types.ObjectId) {
    const user = await this.findById(userId);
    if (user?.security?.question) {
      return user.security.question;
    }
    return null;
  }

  async getUserEarning(userId: Types.ObjectId) {
    return this.walletsService.getUserEarnings(userId);
  }
}
