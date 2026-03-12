import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSubscriptionDto) {
    return this.prisma.subscription.create({
      data: {
        ...data,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
      },
    });
  }

  findAll() {
    return this.prisma.subscription.findMany({ orderBy: { startAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.subscription.findUnique({ where: { id: Number(id) } });
  }

  update(id: string, data: UpdateSubscriptionDto) {
    return this.prisma.subscription.update({
      where: { id: Number(id) },
      data: {
        ...data,
        ...(data.startAt ? { startAt: new Date(data.startAt) } : {}),
        ...(data.endAt ? { endAt: new Date(data.endAt) } : {}),
      },
    });
  }

  remove(id: string) {
    return this.prisma.subscription.delete({ where: { id: Number(id) } });
  }
}
