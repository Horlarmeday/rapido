import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './entities/admin.entity';
import { UsersModule } from '../users/users.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    SubscriptionsModule,
    WalletsModule,
    AppointmentsModule,
    UsersModule,
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
