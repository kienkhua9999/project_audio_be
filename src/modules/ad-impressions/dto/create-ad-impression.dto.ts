export class CreateAdImpressionDto {
  userId?: number;
  episodeId?: number;
  adUnitId: number;
  impressionAt?: string;
  device?: string;
  country?: string;
}
