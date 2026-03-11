import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AdImpressionsService } from './ad-impressions.service';
import { CreateAdImpressionDto } from './dto/create-ad-impression.dto';
import { UpdateAdImpressionDto } from './dto/update-ad-impression.dto';

@Controller('ad-impressions')
export class AdImpressionsController {
  constructor(private readonly adImpressionsService: AdImpressionsService) {}

  @Post()
  create(@Body() dto: CreateAdImpressionDto) {
    return this.adImpressionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.adImpressionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adImpressionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdImpressionDto) {
    return this.adImpressionsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adImpressionsService.remove(id);
  }
}
