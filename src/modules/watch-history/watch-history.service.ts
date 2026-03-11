import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWatchHistoryDto } from './dto/create-watch-history.dto';
import { UpdateWatchHistoryDto } from './dto/update-watch-history.dto';

@Injectable()
export class WatchHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateWatchHistoryDto) {
    return this.prisma.watchHistory.create({
      data: {
        ...data,
        lastWatchedAt: data.lastWatchedAt
          ? new Date(data.lastWatchedAt)
          : undefined,
      },
    });
  }

  findAll() {
    return this.prisma.watchHistory.findMany({
      orderBy: { lastWatchedAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.watchHistory.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateWatchHistoryDto) {
    return this.prisma.watchHistory.update({
      where: { id },
      data: {
        ...data,
        ...(data.lastWatchedAt
          ? { lastWatchedAt: new Date(data.lastWatchedAt) }
          : {}),
      },
    });
  }

  remove(id: string) {
    return this.prisma.watchHistory.delete({ where: { id } });
  }
}
