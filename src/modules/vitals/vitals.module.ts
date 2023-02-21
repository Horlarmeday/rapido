import { Module } from '@nestjs/common';
import { VitalsService } from './vitals.service';
import { VitalsController } from './vitals.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Vital, VitalSchema } from './entities/vital.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vital.name, schema: VitalSchema }]),
  ],
  controllers: [VitalsController],
  providers: [VitalsService],
})
export class VitalsModule {}
