import { Injectable } from '@nestjs/common';
import { ContactStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateContactDto) {
    return this.prisma.contactQuery.create({ data: dto });
  }

  findAll() {
    return this.prisma.contactQuery.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  updateStatus(id: string, status: ContactStatus) {
    return this.prisma.contactQuery.update({
      where: { id },
      data: { status },
    });
  }
}
