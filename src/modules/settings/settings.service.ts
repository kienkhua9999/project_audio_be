import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSettingDto) {
    return this.prisma.setting.create({ data });
  }

  findAll() {
    return this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
  }

  findOne(key: string) {
    return this.prisma.setting.findUnique({ where: { key } });
  }

  update(key: string, data: UpdateSettingDto) {
    return this.prisma.setting.update({ where: { key }, data });
  }

  remove(key: string) {
    return this.prisma.setting.delete({ where: { key } });
  }
}
