export class UpdateEpisodeDto {
  seriesId?: string;
  episodeNumber?: number;
  title?: string;
  videoUrl?: string;
  duration?: number;
  status?: string;
  isExclusive?: boolean;
  hasAds?: boolean;
}
