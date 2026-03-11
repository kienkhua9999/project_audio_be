export class CreateAdImpressionDto {
  userId?: string;
  episodeId?: string;
  adUnitId: string;
  impressionAt?: string;
  device?: string;
  country?: string;
}
