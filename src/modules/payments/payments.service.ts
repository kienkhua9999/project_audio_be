import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreatePaymentDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return this.prisma.payment.create({ data: data as any });
  }

  findAll() {
    return this.prisma.payment.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.payment.findUnique({ where: { id: Number(id) } });
  }

  update(id: string, data: UpdatePaymentDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return this.prisma.payment.update({ where: { id: Number(id) }, data: data as any });
  }

  remove(id: string) {
    return this.prisma.payment.delete({ where: { id: Number(id) } });
  }
}
