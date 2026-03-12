import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEpisodePurchaseDto } from './dto/create-episode-purchase.dto';
import { UpdateEpisodePurchaseDto } from './dto/update-episode-purchase.dto';

@Injectable()
export class EpisodePurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateEpisodePurchaseDto) {
    return this.prisma.episodePurchase.create({ data });
  }

  findAll() {
    return this.prisma.episodePurchase.findMany({
      orderBy: { purchasedAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.episodePurchase.findUnique({ where: { id: Number(id) } });
  }

  update(id: string, data: UpdateEpisodePurchaseDto) {
    return this.prisma.episodePurchase.update({ where: { id: Number(id) }, data });
  }

  remove(id: string) {
    return this.prisma.episodePurchase.delete({ where: { id: Number(id) } });
  }
}
