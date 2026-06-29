import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOfferDto) {
    return this.prisma.offer.create({
      data: {
        title: dto.title,
        description: dto.description,
        discountPercent: dto.discountPercent,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isActive: dto.isActive ?? true,
        imageUrl: dto.imageUrl ?? null,
      },
    });
  }

  /** All offers — for admin management */
  async findAll() {
    return this.prisma.offer.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Nearest single offer: currently active first, then next upcoming */
  async findNearest() {
    const now = new Date();
    const active = await this.prisma.offer.findFirst({
      where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
      orderBy: { endDate: 'asc' },
    });
    if (active) return active;
    return this.prisma.offer.findFirst({
      where: { isActive: true, startDate: { gt: now } },
      orderBy: { startDate: 'asc' },
    });
  }

  /** Active offers whose date window is current — for customer storefront */
  async findActive() {
    const now = new Date();
    return this.prisma.offer.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const offer = await this.prisma.offer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException(`Offer ${id} not found`);
    return offer;
  }

  async update(id: string, dto: UpdateOfferDto) {
    await this.findOne(id);
    return this.prisma.offer.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.discountPercent !== undefined && { discountPercent: dto.discountPercent }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.offer.delete({ where: { id } });
    return { message: 'Offer deleted successfully' };
  }
}
