export class UpdateEpisodeDto {
  seriesId?: number;
  episodeNumber?: number;
  title?: string;
  videoUrl?: string;
  duration?: number;
  status?: string;
  isExclusive?: boolean;
  hasAds?: boolean;
}
