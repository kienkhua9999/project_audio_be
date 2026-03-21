export class CreateEpisodeDto {
  seriesId: number;
  episodeNumber: number;
  title: string;
  videoUrl: string;
  duration: string;
  status: string;
  isExclusive?: boolean;
  hasAds?: boolean;
}
