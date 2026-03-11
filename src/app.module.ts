import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AdImpressionsModule } from './modules/ad-impressions/ad-impressions.module';
import { AdUnitsModule } from './modules/ad-units/ad-units.module';
import { EpisodePurchasesModule } from './modules/episode-purchases/episode-purchases.module';
import { EpisodesModule } from './modules/episodes/episodes.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PlansModule } from './modules/plans/plans.module';
import { SeriesModule } from './modules/series/series.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UsersModule } from './modules/users/users.module';
import { WatchHistoryModule } from './modules/watch-history/watch-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AdImpressionsModule,
    AdUnitsModule,
    EpisodePurchasesModule,
    EpisodesModule,
    PaymentsModule,
    PlansModule,
    SeriesModule,
    SettingsModule,
    SubscriptionsModule,
    UsersModule,
    WatchHistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
