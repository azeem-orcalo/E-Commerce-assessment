import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PRODUCT_SELECT = {
  id: true,
  name: true,
  description: true,
  price: true,
  imageUrl: true,
  stock: true,
  categoryId: true,
  category: { select: { id: true, name: true } },
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Toggle favorite — returns the new status */
  async toggle(userId: string, productId: string): Promise<{ productId: string; favorited: boolean }> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { productId, favorited: false };
    }

    await this.prisma.favorite.create({ data: { userId, productId } });
    return { productId, favorited: true };
  }

  /** Check if a single product is favorited */
  async check(userId: string, productId: string): Promise<{ productId: string; favorited: boolean }> {
    const record = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return { productId, favorited: !!record };
  }

  /** Return all favorited products for the user */
  async list(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { product: { select: PRODUCT_SELECT } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: favorites.map((f) => ({
        ...f.product,
        favorited: true,
      })),
    };
  }
}
