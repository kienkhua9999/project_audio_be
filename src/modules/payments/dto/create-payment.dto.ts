export class CreatePaymentDto {
  userId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  metadata?: Record<string, unknown>;
}
