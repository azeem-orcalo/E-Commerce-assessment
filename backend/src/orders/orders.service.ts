import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private readonly stripe: Stripe | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    this.stripe = key ? new Stripe(key) : null;
  }

  async checkout(userId: string, dto: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let originalAmount = 0;
    for (const item of cart.items) {
      if (item.product.deletedAt) {
        throw new NotFoundException(`Product "${item.product.name}" is no longer available`);
      }
      if (item.product.stock < item.quantity) {
        throw new HttpException(
          `Insufficient stock for "${item.product.name}"`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      originalAmount += Number(item.product.price) * item.quantity;
    }

    // Fetch the first currently-active offer (if any)
    const now = new Date();
    const activeOffer = await this.prisma.offer.findFirst({
      where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
      orderBy: { endDate: 'asc' },
    });

    let discountPercent = 0;
    let discountAmount = 0;
    let totalAmount = originalAmount;

    if (activeOffer) {
      discountPercent = Number(activeOffer.discountPercent);
      discountAmount = parseFloat((originalAmount * discountPercent / 100).toFixed(2));
      totalAmount = parseFloat((originalAmount - discountAmount).toFixed(2));
    }

    const discountInfo = activeOffer
      ? { discountPercent, discountAmount, originalAmount, offerTitle: activeOffer.title }
      : null;

    if (dto.paymentMethod === PaymentMethod.CARD) {
      return this.checkoutWithCard(userId, cart, originalAmount, totalAmount, discountInfo);
    }
    return this.checkoutWithCod(userId, cart, originalAmount, totalAmount, discountInfo);
  }

  private async checkoutWithCod(
    userId: string,
    cart: Awaited<ReturnType<typeof this.prisma.cart.findUnique>> & {
      items: Array<{ productId: string; quantity: number; product: { price: unknown } }>;
    },
    originalAmount: number,
    totalAmount: number,
    discountInfo: { discountPercent: number; discountAmount: number; originalAmount: number; offerTitle: string } | null,
  ) {
    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of cart!.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const created = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          paymentMethod: PaymentMethod.COD,
          totalAmount,
          originalAmount: discountInfo ? originalAmount : null,
          discountPercent: discountInfo ? discountInfo.discountPercent : null,
          discountAmount: discountInfo ? discountInfo.discountAmount : null,
          items: {
            create: cart!.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.product.price as number,
            })),
          },
        },
        include: { items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } } },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart!.id } });
      return created;
    });

    return {
      orderId: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      originalAmount: discountInfo ? originalAmount.toFixed(2) : null,
      discountPercent: discountInfo ? discountInfo.discountPercent : null,
      discountAmount: discountInfo ? discountInfo.discountAmount.toFixed(2) : null,
      offerTitle: discountInfo ? discountInfo.offerTitle : null,
      totalAmount: order.totalAmount.toString(),
      items: order.items,
    };
  }

  private async checkoutWithCard(
    userId: string,
    cart: Awaited<ReturnType<typeof this.prisma.cart.findUnique>> & {
      items: Array<{ productId: string; quantity: number; product: { price: unknown } }>;
    },
    originalAmount: number,
    totalAmount: number,
    discountInfo: { discountPercent: number; discountAmount: number; originalAmount: number; offerTitle: string } | null,
  ) {
    // When Stripe is not configured fall back to a mock payment so the checkout
    // flow still works end-to-end in development / test environments.
    if (!this.stripe) {
      const order = await this.prisma.$transaction(async (tx) => {
        for (const item of cart!.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        const created = await tx.order.create({
          data: {
            userId,
            status: 'PENDING',
            paymentMethod: PaymentMethod.CARD,
            stripePaymentIntentId: null,
            totalAmount,
            originalAmount: discountInfo ? originalAmount : null,
            discountPercent: discountInfo ? discountInfo.discountPercent : null,
            discountAmount: discountInfo ? discountInfo.discountAmount : null,
            items: {
              create: cart!.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: item.product.price as number,
              })),
            },
          },
          include: { items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } } },
        });

        await tx.cartItem.deleteMany({ where: { cartId: cart!.id } });
        return created;
      });

      return {
        orderId: order.id,
        clientSecret: 'mock_client_secret',
        status: order.status,
        paymentMethod: order.paymentMethod,
        originalAmount: discountInfo ? originalAmount.toFixed(2) : null,
        discountPercent: discountInfo ? discountInfo.discountPercent : null,
        discountAmount: discountInfo ? discountInfo.discountAmount.toFixed(2) : null,
        offerTitle: discountInfo ? discountInfo.offerTitle : null,
        totalAmount: order.totalAmount.toString(),
        items: order.items,
      };
    }

    const amountInCents = Math.round(totalAmount * 100);
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'gbp',
      metadata: { userId },
    });

    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of cart!.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const created = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          paymentMethod: PaymentMethod.CARD,
          stripePaymentIntentId: paymentIntent.id,
          totalAmount,
          originalAmount: discountInfo ? originalAmount : null,
          discountPercent: discountInfo ? discountInfo.discountPercent : null,
          discountAmount: discountInfo ? discountInfo.discountAmount : null,
          items: {
            create: cart!.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.product.price as number,
            })),
          },
        },
        include: { items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } } },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart!.id } });
      return created;
    });

    return {
      orderId: order.id,
      clientSecret: paymentIntent.client_secret,
      status: order.status,
      paymentMethod: order.paymentMethod,
      originalAmount: discountInfo ? originalAmount.toFixed(2) : null,
      discountPercent: discountInfo ? discountInfo.discountPercent : null,
      discountAmount: discountInfo ? discountInfo.discountAmount.toFixed(2) : null,
      offerTitle: discountInfo ? discountInfo.offerTitle : null,
      totalAmount: order.totalAmount.toString(),
      items: order.items,
    };
  }

  async getOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true, price: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders;
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true, price: true } },
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async clearAll(userId: string) {
    await this.prisma.review.deleteMany({ where: { order: { userId } } });
    await this.prisma.orderItem.deleteMany({ where: { order: { userId } } });
    const { count } = await this.prisma.order.deleteMany({ where: { userId } });
    return { deleted: count };
  }
}
