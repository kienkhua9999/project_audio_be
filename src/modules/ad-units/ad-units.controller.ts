import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AdUnitsService } from './ad-units.service';
import { CreateAdUnitDto } from './dto/create-ad-unit.dto';
import { UpdateAdUnitDto } from './dto/update-ad-unit.dto';

@Controller('ad-units')
export class AdUnitsController {
  constructor(private readonly adUnitsService: AdUnitsService) {}

  @Post()
  create(@Body() dto: CreateAdUnitDto) {
    return this.adUnitsService.create(dto);
  }

  @Get()
  findAll() {
    return this.adUnitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adUnitsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdUnitDto) {
    return this.adUnitsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adUnitsService.remove(id);
  }
}
