import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';

@Injectable()
export class EpisodesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateEpisodeDto) {
    const episode = await this.prisma.episode.create({ data });
    const series = await this.prisma.series.findUnique({
      where: { id: episode.seriesId },
    });
    return this.formatEpisode(episode, series?.title || '');
  }

  async findAll() {
    const episodes = await this.prisma.episode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        series: {
          select: {
            title: true,
          },
        },
      },
    });
    return episodes.map((ep) => this.formatEpisode(ep, ep.series.title));
  }

  async findOne(id: string) {
    const episode = await this.prisma.episode.findFirst({
      where: { id: Number(id) },
      include: {
        series: {
          include: {
            episodes: {
              select: {
                id: true,
                episodeNumber: true,
                title: true,
                duration: true,
                thumbnailUrl: true,
              },
              orderBy: {
                episodeNumber: 'asc',
              },
            },
          },
        },
      },
    });

    if (!episode) return null;

    // Lấy danh sách phim đề xuất (không bao gồm phim hiện tại)
    const recommendations = await this.prisma.series.findMany({
      where: {
        id: { not: episode.seriesId },
        status: 'published',
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        image: true,
        tags: true,
        views: true,
      },
    });

    return {
      episode: this.formatEpisode(episode, episode.series.title),
      series: this.formatSeries(episode.series),
      recommendations: recommendations.map((r) => this.formatSeries(r)),
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
    return {
      ...series,
      image: series.image
        ? `https://${process.env.BUCKET}.s3.amazonaws.com/${encodeURIComponent(series.title)}/${encodeURIComponent(series.image)}`
        : null,
      tags: series.tags
        ? typeof series.tags === 'string'
          ? (series.tags as string).split(',')
          : series.tags
        : [],
      views:
        series.views > 0
          ? series.views
          : Math.floor(Math.random() * 50000) + 1000,
      totalEpisodes: series.episodes ? series.episodes.length : undefined,
      episodes: series.episodes
        ? series.episodes.map((ep) => this.formatEpisode(ep, series.title))
        : undefined,
    };
  }

  update(id: string, data: UpdateEpisodeDto) {
    return this.prisma.episode
      .update({
        where: { id: Number(id) },
        data,
        include: { series: { select: { title: true } } },
      })
      .then((ep) => this.formatEpisode(ep, ep.series.title));
  }

  remove(id: string) {
    return this.prisma.episode.delete({ where: { id: Number(id) } });
  }
}
