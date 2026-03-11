import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdUnitDto } from './dto/create-ad-unit.dto';
import { UpdateAdUnitDto } from './dto/update-ad-unit.dto';

@Injectable()
export class AdUnitsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateAdUnitDto) {
    return this.prisma.adUnit.create({ data });
  }

  findAll() {
    return this.prisma.adUnit.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: string) {
    return this.prisma.adUnit.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateAdUnitDto) {
    return this.prisma.adUnit.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.adUnit.delete({ where: { id } });
  }
}
