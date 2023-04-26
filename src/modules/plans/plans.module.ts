import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Plan, PlanSchema } from './entities/plan.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
  ],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
