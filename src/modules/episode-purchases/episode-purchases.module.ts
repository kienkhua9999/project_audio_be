import { Module } from '@nestjs/common';
import { EpisodePurchasesController } from './episode-purchases.controller';
import { EpisodePurchasesService } from './episode-purchases.service';

@Module({
  controllers: [EpisodePurchasesController],
  providers: [EpisodePurchasesService],
})
export class EpisodePurchasesModule {}
