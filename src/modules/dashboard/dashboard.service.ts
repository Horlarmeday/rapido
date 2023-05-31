import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { AppointmentsService } from '../appointments/appointments.service';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly walletsService: WalletsService,
  ) {}
  async specialistDashboard(userId: Types.ObjectId) {
    const [appointmentsData, nextAppointment, totalEarnings] =
      await Promise.all([
        this.appointmentsService.aggregatedData(userId),
        this.appointmentsService.nextAppointment(userId),
        await this.walletsService.totalEarningsData(userId),
      ]);
    return {
      appointmentsData,
      nextAppointment,
      totalEarnings,
    };
  }
}
