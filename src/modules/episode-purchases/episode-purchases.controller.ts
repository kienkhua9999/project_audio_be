import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { EpisodePurchasesService } from './episode-purchases.service';
import { CreateEpisodePurchaseDto } from './dto/create-episode-purchase.dto';
import { UpdateEpisodePurchaseDto } from './dto/update-episode-purchase.dto';

@Controller('episode-purchases')
export class EpisodePurchasesController {
  constructor(private readonly episodePurchasesService: EpisodePurchasesService) {}

  @Post()
  create(@Body() dto: CreateEpisodePurchaseDto) {
    return this.episodePurchasesService.create(dto);
  }

  @Get()
  findAll() {
    return this.episodePurchasesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.episodePurchasesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEpisodePurchaseDto) {
    return this.episodePurchasesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.episodePurchasesService.remove(id);
  }
}
