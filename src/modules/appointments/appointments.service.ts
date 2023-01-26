import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Appointment,
  AppointmentDocument,
} from './entities/appointment.entity';
import { Zoom } from '../../common/external/zoom/zoom';
import { UsersService } from '../users/users.service';
import { SUCCESS } from '../../core/constants';
import { create } from 'src/common/crud/crud';
import { IJwtPayload } from '../auth/types/jwt-payload.type';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private AppointmentModel: Model<AppointmentDocument>,
    private readonly zoom: Zoom,
    private readonly usersService: UsersService,
  ) {}
  async create(
    createAppointmentDto: CreateAppointmentDto,
    currentUser: IJwtPayload,
  ) {
    const specialist = await this.usersService.findById(
      createAppointmentDto.specialist,
    );

    const response = await this.zoom.createMeeting({
      start_time: createAppointmentDto.start_time,
      topic: `Scheduled Appointment Between ${specialist.profile.first_name} and ${currentUser.first_name}`,
    });

    if (response.status === SUCCESS) {
      const { join_url, start_url, id } = response.data;
      return await create(this.AppointmentModel, {
        ...createAppointmentDto,
        join_url,
        start_url,
        patient: currentUser.sub,
        zoom_meeting_id: id,
      });
    }
    throw new InternalServerErrorException(
      'Error occurred creating appointment',
    );
  }
}
