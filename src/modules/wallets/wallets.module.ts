import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from './entities/wallet.entity';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { PaymentHandler } from '../../common/external/payment/payment.handler';
import {
  WalletTransaction,
  WalletTransactionSchema,
} from './entities/wallet-transactions.entity';
import { BanksModule } from '../banks/banks.module';
import { AdminSettingsModule } from '../admin-settings/admin-settings.module';
import { Paystack } from '../../common/external/payment/providers/paystack';

@Module({
  imports: [
    BanksModule,
    AdminSettingsModule,
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
    ]),
  ],
  controllers: [WalletsController],
  providers: [WalletsService, GeneralHelpers, PaymentHandler, Paystack],
  exports: [WalletsService],
})
export class WalletsModule {}
