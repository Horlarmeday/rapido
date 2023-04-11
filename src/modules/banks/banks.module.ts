import { Module } from '@nestjs/common';
import { BanksService } from './banks.service';
import { BanksController } from './banks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Bank, BankSchema } from './entities/bank.entity';
import { Paystack } from '../../common/external/payment/providers/paystack';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bank.name, schema: BankSchema }]),
  ],
  controllers: [BanksController],
  providers: [BanksService, Paystack],
  exports: [BanksService],
})
export class BanksModule {}
