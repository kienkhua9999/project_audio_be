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
    search?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
    const where: Prisma.SeriesWhereInput = {};
    if (type) {
      where.type = type;
    }

    if (search) {
      where.title = { contains: search };
    }

    console.log('Series where:', where);

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

    const formattedItems = items.map((s) => this.formatSeries(s));
    this.shuffleArray(formattedItems);

    return {
      items: formattedItems,
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

  async getNews(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.series.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
          views: true,
        },
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.series.count({
        where: { status: 'published' },
      }),
    ]);

    const formattedItems = items.map((s) => this.formatSeries(s));
    this.shuffleArray(formattedItems);

    return {
      items: formattedItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async update(id: string, data: UpdateSeriesDto) {
    const series = await this.prisma.series.update({
      where: { id: Number(id) },
      data,
    });
    return this.formatSeries(series);
  }

  async updateView(id: string): Promise<any> {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    await this.prisma.series.update({
      where: { id: numericId },
      data: {
        views: { increment: 1 },
      },
    });

    return true;
  }

  remove(id: string) {
    return this.prisma.series.delete({ where: { id: Number(id) } });
  }
}
