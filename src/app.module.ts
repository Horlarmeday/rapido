import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { AuthModule } from './modules/auth/auth.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { UserSettingsModule } from './modules/user-settings/user-settings.module';
import { AdminSettingsModule } from './modules/admin-settings/admin-settings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { VitalsModule } from './modules/vitals/vitals.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { CardsModule } from './modules/cards/cards.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { BanksModule } from './modules/banks/banks.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { WebsocketGateway } from './core/websocket/websocket.gateway';
import { HealthCheckupModule } from './modules/health-checkup/health-checkup.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { LifeguardsModule } from './modules/lifeguards/lifeguards.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { RewardsModule } from './modules/rewards/rewards.module';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    UsersModule,
    AuthModule,
    TokensModule,
    MongooseModule.forRoot(<string>process.env.MONGO_URL),
    AppointmentsModule,
    UserSettingsModule,
    AdminSettingsModule,
    PaymentsModule,
    TransactionsModule,
    RemindersModule,
    VitalsModule,
    PlansModule,
    SubscriptionsModule,
    CardsModule,
    WebhooksModule,
    BanksModule,
    RatingsModule,
    HealthCheckupModule,
    WalletsModule,
    LifeguardsModule,
    ReferralsModule,
    RewardsModule,
  ],
  controllers: [AppController],
  providers: [AppService, WebsocketGateway],
})
export class AppModule {}
