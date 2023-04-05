import { Module } from '@nestjs/common';
import { HealthCheckupService } from './health-checkup.service';
import { HealthCheckupController } from './health-checkup.controller';
import { Infermedica } from '../../common/external/infermedica/infermedica';
import { MongooseModule } from '@nestjs/mongoose';
import {
  HealthCheckup,
  HealthCheckupSchema,
} from './entities/health-checkup.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HealthCheckup.name, schema: HealthCheckupSchema },
    ]),
  ],
  controllers: [HealthCheckupController],
  providers: [HealthCheckupService, Infermedica],
})
export class HealthCheckupModule {}
