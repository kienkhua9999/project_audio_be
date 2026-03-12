export class CreateWatchHistoryDto {
  userId: number;
  episodeId: number;
  progress: number;
  lastWatchedAt?: string;
}
