export class UpdatePaymentDto {
  userId?: string;
  amount?: number;
  currency?: string;
  method?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}
