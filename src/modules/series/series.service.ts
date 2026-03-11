import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SeriesService {
  constructor(private readonly prisma: PrismaService) {}

  getHomeSlider() {
    return this.prisma.series.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      where: { status: 'published' },
    });
  }

  async getHomeSections() {
    const latestSeries = await this.prisma.series.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: { status: 'published' },
    });

    const exclusiveSeries = await this.prisma.series.findMany({
      where: { isExclusive: true, status: 'published' },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    const shuffledSeries = await this.prisma.series.findMany({
      take: 10,
      orderBy: { title: 'asc' },
      where: { status: 'published' },
    });

    return [
      {
        sectionName: 'Phim ngắn hot',
        items: latestSeries,
      },
      {
        sectionName: 'Phim bộ mới cập nhật',
        items: exclusiveSeries.length > 0 ? exclusiveSeries : shuffledSeries,
      },
      {
        sectionName: 'Phim lồng tiếng',
        items: shuffledSeries,
      },
      {
        sectionName: 'Phim tình cảm',
        items: latestSeries,
      },
    ];
  }

  create(data: CreateSeriesDto) {
    return this.prisma.series.create({ data });
  }

  async findAll(type?: string, page: number = 1, limit: number = 20) {
    const where: Prisma.SeriesWhereInput = {};
    if (type) {
      where.type = type;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.series.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.series.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const series = await this.prisma.series.findUnique({
      where: { id },
      include: {
        episodes: {
          select: {
            id: true,
            episodeNumber: true,
            title: true,
            duration: true,
            videoUrl: true,
            thumbnailUrl: true,
          },
          orderBy: {
            episodeNumber: 'asc',
          },
        },
      },
    });

    if (!series) return null;

    return {
      ...series,
      tags: series.tags ? series.tags.split(',') : [],
      totalEpisodes: series.episodes.length,
    };
  }

  update(id: string, data: UpdateSeriesDto) {
    return this.prisma.series.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.series.delete({ where: { id } });
  }
}
