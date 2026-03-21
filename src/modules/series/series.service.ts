/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SeriesService {
  constructor(private readonly prisma: PrismaService) { }

  async getHomeSlider(): Promise<any> {
    const series = await this.prisma.series.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      where: { status: 'published' },
    });
    console.log('Slider series count:', series.length);
    return series.map((s) => this.formatSeries(s));
  }

  async getHomeSections(): Promise<any> {
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

    console.log('Sections items count:', {
      latest: latestSeries.length,
      exclusive: exclusiveSeries.length,
      shuffled: shuffledSeries.length,
    });

    return [
      {
        sectionName: 'Phim ngắn hot',
        items: latestSeries.map((s) => this.formatSeries(s)),
      },
      {
        sectionName: 'Phim bộ mới cập nhật',
        items: (shuffledSeries.length > 0
          ? shuffledSeries
          : exclusiveSeries
        ).map((s) => this.formatSeries(s)),
      },
    ];
  }

  async create(data: CreateSeriesDto) {
    const series = await this.prisma.series.create({ data });
    return this.formatSeries(series);
  }

  async findAll(
    type?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
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
      items: items.map((s) => this.formatSeries(s)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      console.warn('Invalid series ID received:', id);
      return null;
    }

    const series = await this.prisma.series.findUnique({
      where: { id: numericId },
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

    return this.formatSeries(series);
  }

  private formatEpisode(episode: any, seriesTitle: string): any {
    if (!episode) return null;
    return {
      ...episode,
      videoUrl: episode.videoUrl
        ? `https://${process.env.BUCKET}.s3.amazonaws.com/${encodeURIComponent(seriesTitle)}/${encodeURIComponent(episode.videoUrl)}`
        : null,
      thumbnailUrl: episode.thumbnailUrl
        ? `https://${process.env.BUCKET}.s3.amazonaws.com/${encodeURIComponent(seriesTitle)}/${encodeURIComponent(episode.thumbnailUrl)}`
        : null,
    };
  }

  private formatSeries(series: any): any {
    if (!series) return null;
    const formatted = {
      ...series,
      image: series.image
        ? `https://${process.env.BUCKET}.s3.amazonaws.com/${encodeURIComponent(series.title)}/${encodeURIComponent(series.image)}`
        : null,
      tags:
        series.tags && typeof series.tags === 'string'
          ? (series.tags as string).split(',')
          : series.tags || [],
      views:
        series.views > 0
          ? series.views
          : Math.floor(Math.random() * 50000) + 1000,
      totalEpisodes: series.episodes ? series.episodes.length : undefined,
      episodes: series.episodes
        ? series.episodes.map((ep) => this.formatEpisode(ep, series.title))
        : undefined,
    };

    return formatted;
  }

  async update(id: string, data: UpdateSeriesDto) {
    const series = await this.prisma.series.update({
      where: { id: Number(id) },
      data,
    });
    return this.formatSeries(series);
  }

  remove(id: string) {
    return this.prisma.series.delete({ where: { id: Number(id) } });
  }
}
