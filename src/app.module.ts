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
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { CardsModule } from './modules/cards/cards.module';

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
    PlansModule,
    SubscriptionsModule,
    CardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
