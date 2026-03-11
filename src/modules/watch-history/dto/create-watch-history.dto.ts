export class CreateWatchHistoryDto {
  userId: string;
  episodeId: string;
  progress: number;
  lastWatchedAt?: string;
}
