import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { create } from '../../common/crud/crud';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from './entities/admin.entity';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { PatientAdvancedFilterDto } from '../users/dto/patient-advanced-filter.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { SpecialistAdvancedFilterDto } from '../users/dto/specialist-advanced-filter.dto';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private readonly usersService: UsersService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly appointmentsService: AppointmentsService,
    private readonly walletsService: WalletsService,
  ) {}
  async createAdminAccount(createAdminDto: CreateAdminDto) {
    return await create(this.adminModel, { ...createAdminDto });
  }

  async getPatients(patientAdvancedFilterDto: PatientAdvancedFilterDto) {
    return await this.usersService.getPatients(patientAdvancedFilterDto);
  }

  async getPatient(userId: Types.ObjectId) {
    const user = await this.usersService.findOne({ _id: userId });
    const [subscriptions, appointments] = await Promise.all([
      this.subscriptionsService.getUserSubscriptions(userId),
      this.appointmentsService.getPatientAppointments(userId, {}),
    ]);
    return { ...user, subscriptions, appointments };
  }

  async getSpecialists(
    specialistAdvancedFilterDto: SpecialistAdvancedFilterDto,
  ) {
    return await this.usersService.getSpecialists(specialistAdvancedFilterDto);
  }

  async getSpecialist(userId: Types.ObjectId) {
    const user = await this.usersService.findOne({ _id: userId });
    const [transactions, appointments] = await Promise.all([
      this.walletsService.getWalletTransactions(userId),
      this.appointmentsService.getSpecialistAppointments(userId, {}),
    ]);
    return { ...user, transactions, appointments };
  }
}
