import { Module } from '@nestjs/common';
import { LifeguardsService } from './lifeguards.service';
import { LifeguardsController } from './lifeguards.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Lifeguard, LifeguardSchema } from './entities/lifeguard.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PaymentLog, PaymentLogSchema } from './entities/payment-logs.entity';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { PaymentHandler } from '../../common/external/payment/payment.handler';
import { Paystack } from '../../common/external/payment/providers/paystack';
import { AdminSettingsModule } from '../admin-settings/admin-settings.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AdminSettingsModule,
    AuthModule,
    JwtModule.register({
      secret: process.env.JWTKEY,
      signOptions: {
        expiresIn: process.env.TOKEN_EXPIRATION,
      },
    }),
    UsersModule,
    MongooseModule.forFeature([
      { name: Lifeguard.name, schema: LifeguardSchema },
      { name: PaymentLog.name, schema: PaymentLogSchema },
    ]),
  ],
  controllers: [LifeguardsController],
  providers: [LifeguardsService, GeneralHelpers, PaymentHandler, Paystack],
  exports: [LifeguardsService],
})
export class LifeguardsModule {}
