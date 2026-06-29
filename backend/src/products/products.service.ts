import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductSortBy, QueryProductsDto } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryProductsDto) {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      sortBy = ProductSortBy.FEATURED,
      page = 1,
      limit = 12,
    } = query;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(categoryId && { categoryId }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { gte: new Prisma.Decimal(minPrice) }),
          ...(maxPrice !== undefined && { lte: new Prisma.Decimal(maxPrice) }),
        },
      }),
    };

    const orderBy = this.resolveOrderBy(sortBy);
    const skip = (page - 1) * limit;

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { category: { select: { id: true, name: true } } },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  private resolveOrderBy(
    sortBy: ProductSortBy,
  ): Prisma.ProductOrderByWithRelationInput {
    switch (sortBy) {
      case ProductSortBy.BEST_SELLER:
        return { orderItems: { _count: 'desc' } };
      case ProductSortBy.PRICE_ASC:
        return { price: 'asc' };
      case ProductSortBy.PRICE_DESC:
        return { price: 'desc' };
      case ProductSortBy.NEWEST:
        return { createdAt: 'desc' };
      case ProductSortBy.FEATURED:
      default:
        return { createdAt: 'desc' };
    }
  }
}
