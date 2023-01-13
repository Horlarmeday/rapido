import { Injectable } from '@nestjs/common';
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

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly fileUpload: FileUploadHelper,
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
  async findById(id: Types.ObjectId): Promise<UserDocument> {
    return await findById(this.userModel, id);
  }

  async findOneByEmail(email: string): Promise<UserDocument> {
    return await findOne(this.userModel, { 'profile.contact.email': email });
  }

  async findOneByEmailOrPhone(email: string, phone: string): Promise<User> {
    return await findOne(this.userModel, {
      $or: [
        {
          'profile.contact.email': email || '',
        },
        {
          'profile.contact.number': phone || '',
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
    const uploadedFiles = await this.uploadFiles(profileSetupDto, files);
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
    return await updateOne(
      this.userModel,
      { _id: userId },
      {
        profile: {
          ...profileSetupDto,
          contact: {
            address1,
            address2,
            country,
            zip_code,
            state,
          },
        },
        emergency_contacts,
        dependants,
        pre_existing_conditions: uploadedFiles?.length
          ? uploadedFiles
          : pre_existing_conditions,
      },
    );
  }

  async uploadFiles(
    profileSetupDto: ProfileSetupDto,
    files: Express.Multer.File[],
  ) {
    if (!files) return;
    const { pre_existing_conditions } = profileSetupDto;
    if (!pre_existing_conditions?.length) return;
    return files.map(async (file, i) => {
      const uploadedFile = await this.fileUpload.uploadToS3(
        file.buffer,
        file.originalname,
      );
      return (pre_existing_conditions[i].file = uploadedFile);
    });
  }
}
