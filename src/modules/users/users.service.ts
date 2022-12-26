import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import { create, deleteOne, findById, findOne } from '../../common/crud/crud';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    return await create(this.userModel, {
      ...createUserDto,
      phone: {
        country_code: createUserDto.country_code,
        number: createUserDto.phone,
      },
    });
  }
  async findById(id: string): Promise<User> {
    return await findById(this.userModel, id);
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
}
