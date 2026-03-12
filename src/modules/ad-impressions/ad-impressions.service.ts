import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdImpressionDto } from './dto/create-ad-impression.dto';
import { UpdateAdImpressionDto } from './dto/update-ad-impression.dto';

@Injectable()
export class AdImpressionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateAdImpressionDto) {
    return this.prisma.adImpression.create({
      data: {
        ...data,
        impressionAt: data.impressionAt
          ? new Date(data.impressionAt)
          : undefined,
      },
    });
  }

  findAll() {
    return this.prisma.adImpression.findMany({
      orderBy: { impressionAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.adImpression.findUnique({ where: { id: Number(id) } });
  }

  update(id: string, data: UpdateAdImpressionDto) {
    return this.prisma.adImpression.update({
      where: { id: Number(id) },
      data: {
        ...data,
        ...(data.impressionAt
          ? { impressionAt: new Date(data.impressionAt) }
          : {}),
      },
    });
  }

  remove(id: string) {
    return this.prisma.adImpression.delete({ where: { id: Number(id) } });
  }
}
