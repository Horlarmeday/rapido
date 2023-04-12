import { Injectable } from '@nestjs/common';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Interval,
  Reminder,
  ReminderDocument,
} from './entities/reminder.entity';
import { Model, Types } from 'mongoose';
import { create, deleteOne, find, updateOne } from 'src/common/crud/crud';
import { GeneralHelpers } from '../../common/helpers/general.helpers';

@Injectable()
export class RemindersService {
  constructor(
    @InjectModel(Reminder.name) private reminderModel: Model<ReminderDocument>,
    private readonly generalHelpers: GeneralHelpers,
  ) {}
  async createReminder(
    createReminderDto: CreateReminderDto,
    userId: Types.ObjectId,
  ) {
    return await create(this.reminderModel, {
      ...createReminderDto,
      interval: createReminderDto?.interval || Interval.DAYS,
      userId,
    });
  }

  async updateReminder(
    reminderId: string,
    updateReminderDto: UpdateReminderDto,
  ) {
    return await updateOne(
      this.reminderModel,
      { _id: reminderId },
      { ...updateReminderDto },
    );
  }

  async removeReminder(reminderId: string) {
    return await deleteOne(this.reminderModel, { _id: reminderId });
  }

  async getUserReminders(userId: Types.ObjectId) {
    const reminders = await find(this.reminderModel, { userId });
    return this.generalHelpers.groupBy(reminders, 'start_date');
  }
}
