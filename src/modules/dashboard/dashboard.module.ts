import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { WalletsModule } from '../wallets/wallets.module';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
  imports: [WalletsModule, AppointmentsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
