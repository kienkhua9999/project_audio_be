import { Module } from '@nestjs/common';
import { AdUnitsController } from './ad-units.controller';
import { AdUnitsService } from './ad-units.service';

@Module({
  controllers: [AdUnitsController],
  providers: [AdUnitsService],
})
export class AdUnitsModule {}
