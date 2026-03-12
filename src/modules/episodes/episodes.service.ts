import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';

@Injectable()
export class EpisodesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateEpisodeDto) {
    return this.prisma.episode.create({ data });
  }

  findAll() {
    return this.prisma.episode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        series: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            tags: true,
            views: true,
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
      episode: {
        id: episode.id,
        episodeNumber: episode.episodeNumber,
        title: episode.title,
        videoUrl: episode.videoUrl,
        thumbnailUrl: episode.thumbnailUrl,
        duration: episode.duration,
        isExclusive: episode.isExclusive,
        hasAds: episode.hasAds,
      },
      series: {
        id: episode.series.id,
        title: episode.series.title,
        description: episode.series.description,
        image: episode.series.image,
        tags: episode.series.tags ? episode.series.tags.split(',') : [],
        views:
          episode.series.views > 0
            ? episode.series?.views
            : Math.floor(Math.random() * 50000) + 1000,
        totalEpisodes: episode.series.episodes.length,
        episodesList: episode.series.episodes,
      },
      recommendations: recommendations.map((r) => ({
        ...r,
        tags: r.tags ? r.tags.split(',') : [],
        views: r.views > 0 ? r.views : Math.floor(Math.random() * 50000) + 1000,
      })),
    };
  }

  update(id: string, data: UpdateEpisodeDto) {
    return this.prisma.episode.update({ where: { id: Number(id) }, data });
  }

  remove(id: string) {
    return this.prisma.episode.delete({ where: { id: Number(id) } });
  }
}
