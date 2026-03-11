export class CreateSeriesDto {
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  bannerImage?: string;
  status: string;
  isExclusive?: boolean;
  hasAds?: boolean;
}
