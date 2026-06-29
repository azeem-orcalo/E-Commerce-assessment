import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PRODUCT_SELECT = {
  id: true,
  name: true,
  description: true,
  price: true,
  imageUrl: true,
  stock: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true } },
} as const;

@Injectable()
export class SuggestionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Category-affinity suggestions for a logged-in user.
   *
   * Algorithm:
   *   1. Collect the distinct categoryIds the user has ordered from.
   *   2. If they have no history, fall back to bestsellers (cold-start).
   *   3. Return in-stock products from those categories that the user
   *      hasn't already ordered, newest first, up to `limit`.
   *   4. If fewer than 4 results, pad with bestsellers not already included.
   */
  async getSuggestions(userId: string, limit = 8) {
    // 1. Pull order history
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          select: { productId: true, product: { select: { categoryId: true } } },
        },
      },
    });

    const orderedProductIds = new Set<string>();
    const purchasedCategoryIds = new Set<string>();

    for (const order of orders) {
      for (const item of order.items) {
        orderedProductIds.add(item.productId);
        purchasedCategoryIds.add(item.product.categoryId);
      }
    }

    // 2. Cold-start fallback
    if (purchasedCategoryIds.size === 0) {
      return this.getPopular(limit);
    }

    // 3. Category-affinity query
    const suggestions = await this.prisma.product.findMany({
      where: {
        deletedAt: null,
        stock: { gt: 0 },
        categoryId: { in: [...purchasedCategoryIds] },
        ...(orderedProductIds.size > 0 && { id: { notIn: [...orderedProductIds] } }),
      },
      select: PRODUCT_SELECT,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // 4. Pad with bestsellers if thin results
    if (suggestions.length < 4) {
      const popular = await this.getPopular(limit);
      const seen = new Set(suggestions.map((s) => s.id));
      const extra = popular
        .filter((p) => !seen.has(p.id))
        .slice(0, limit - suggestions.length);
      return [...suggestions, ...extra];
    }

    return suggestions;
  }

  /**
   * Global bestsellers — products ranked by total units sold across all orders.
   * Used as the public endpoint and as the cold-start fallback.
   */
  async getPopular(limit = 8) {
    // Group order items by product, summing quantities
    const topItems = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit * 3, // fetch extra so we can filter out-of-stock
    });

    if (topItems.length === 0) {
      // No orders yet — return newest products as a reasonable fallback
      return this.prisma.product.findMany({
        where: { deletedAt: null, stock: { gt: 0 } },
        select: PRODUCT_SELECT,
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    }

    const rankedIds = topItems.map((i) => i.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: rankedIds }, deletedAt: null, stock: { gt: 0 } },
      select: PRODUCT_SELECT,
      take: limit,
    });

    // Re-sort to preserve the bestseller ranking from groupBy
    const rankMap = new Map(rankedIds.map((id, i) => [id, i]));
    products.sort(
      (a, b) => (rankMap.get(a.id) ?? 999) - (rankMap.get(b.id) ?? 999),
    );

    return products;
  }
}
