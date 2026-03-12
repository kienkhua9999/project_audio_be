import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateUserDto) {
    return this.prisma.user.create({ data });
  }

  findAll() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id: Number(id) } });
  }

  update(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({ where: { id: Number(id) }, data });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id: Number(id) } });
  }
}
