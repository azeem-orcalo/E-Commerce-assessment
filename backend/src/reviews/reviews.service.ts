import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    // Verify order belongs to user and is SHIPPED
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, userId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'DELIVERED') {
      throw new BadRequestException('Reviews can only be submitted for delivered orders');
    }

    // Verify product was in that order
    const orderItem = await this.prisma.orderItem.findFirst({
      where: { orderId: dto.orderId, productId: dto.productId },
    });
    if (!orderItem) {
      throw new BadRequestException('Product was not part of this order');
    }

    // Check for duplicate review
    const existing = await this.prisma.review.findUnique({
      where: {
        userId_productId_orderId: {
          userId,
          productId: dto.productId,
          orderId: dto.orderId,
        },
      },
    });
    if (existing) throw new ConflictException('You have already reviewed this product for this order');

    return this.prisma.review.create({
      data: {
        userId,
        productId: dto.productId,
        orderId: dto.orderId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
  }

  async findByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
  }

  async checkReviewed(userId: string, productId: string, orderId: string) {
    const review = await this.prisma.review.findUnique({
      where: {
        userId_productId_orderId: { userId, productId, orderId },
      },
    });
    return { reviewed: !!review, review: review ?? null };
  }
}
