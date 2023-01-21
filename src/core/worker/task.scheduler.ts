import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import * as moment from 'moment';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TaskScheduler {
  constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

  async addCron(func, jobName) {
    const date = moment().add('5', 'seconds').toDate();
    const job = new CronJob(date, () => func);
    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();
  }
}
