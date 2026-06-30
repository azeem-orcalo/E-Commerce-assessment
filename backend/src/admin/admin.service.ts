import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrders(page: number, limit: number, status?: OrderStatus) {
    const where = status ? { status } : {};
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, imageUrl: true } },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: { page, limit, total },
    };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
      await this.prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.order.update({ where: { id: orderId }, data: { status } });
      });
    } else {
      await this.prisma.order.update({ where: { id: orderId }, data: { status } });
    }

    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
      },
    });
  }

  async getUsers(page: number, limit: number, search?: string) {
    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          city: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, meta: { page, limit, total } };
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        city: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'User deleted successfully' };
  }

  async getDashboardStats() {
    const [totalRevenue, ordersByStatus, topProducts, totalOrders, activeProducts] = await Promise.all([
      this.prisma.order.aggregate({
        where: { status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED] } },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      this.prisma.order.count(),
      this.prisma.product.count({ where: { stock: { gt: 0 } } }),
    ]);

    const productIds = topProducts.map((p) => p.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, imageUrl: true, description: true, price: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return {
      totalRevenue: Number(totalRevenue._sum.totalAmount ?? 0),
      totalOrders,
      activeStock: activeProducts,
      ordersByStatus: ordersByStatus.map((o) => ({
        status: o.status,
        count: o._count.id,
      })),
      topProducts: topProducts.map((tp) => {
        const product = productMap.get(tp.productId);
        return {
          name: product?.name ?? 'Unknown',
          imageUrl: product?.imageUrl ?? null,
          description: product?.description ?? '',
          price: product ? Number(product.price) : 0,
          unitsSold: tp._sum.quantity ?? 0,
        };
      }),
    };
  }
}
