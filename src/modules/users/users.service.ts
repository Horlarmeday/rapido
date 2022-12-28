import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model, Types } from 'mongoose';
import { create, deleteOne, findById, findOne } from '../../common/crud/crud';
import { SocialMediaUserType } from '../auth/types/social-media.type';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    return await create(this.userModel, {
      ...createUserDto,
      phone: {
        country_code: createUserDto?.country_code,
        number: createUserDto?.phone,
      },
    });
  }

  async createSocialMediaUser(
    socialMediaUserType: SocialMediaUserType,
  ): Promise<UserDocument> {
    return await create(this.userModel, {
      ...socialMediaUserType,
    });
  }
  async findById(id: Types.ObjectId): Promise<User> {
    return await findById(this.userModel, id);
  }

  async findOneByEmail(email: string): Promise<UserDocument> {
    return await findOne(this.userModel, { email });
  }

  async findOneByEmailOrPhone(email: string, phone: string): Promise<User> {
    return await findOne(this.userModel, {
      $or: [
        {
          email: email || '',
        },
        {
          phone: phone || '',
        },
      ],
    });
  }
  async removeOne(id: string) {
    return await deleteOne(this.userModel, { id });
  }

  async updateOne(userId: Types.ObjectId, fieldsToUpdate: any) {
    return this.userModel.updateOne({ _id: userId }, { $set: fieldsToUpdate });
  }
}
