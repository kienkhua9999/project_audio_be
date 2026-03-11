import { Module } from '@nestjs/common';
import { AdImpressionsController } from './ad-impressions.controller';
import { AdImpressionsService } from './ad-impressions.service';

@Module({
  controllers: [AdImpressionsController],
  providers: [AdImpressionsService],
})
export class AdImpressionsModule {}
