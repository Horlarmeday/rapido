import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import * as moment from 'moment';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TaskScheduler {
  constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

  async addCron(func, jobName, timeToRun = [5, 'seconds']) {
    const date = moment()
      .add(...timeToRun)
      .toDate();
    const job = new CronJob(date, () => func);
    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();
  }
}
