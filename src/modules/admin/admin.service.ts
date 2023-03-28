import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { create } from '../../common/crud/crud';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from './entities/admin.entity';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private readonly usersService: UsersService,
  ) {}
  async createAdminAccount(createAdminDto: CreateAdminDto) {
    const result = await create(this.adminModel, { ...createAdminDto });
    return sendSuccessResponse(Messages.CREATED, result);
  }
}
