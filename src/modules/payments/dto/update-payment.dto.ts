export class UpdatePaymentDto {
  userId?: number;
  amount?: number;
  currency?: string;
  method?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}
