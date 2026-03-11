export class CreatePlanDto {
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  isActive?: boolean;
}
