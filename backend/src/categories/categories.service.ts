import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search = '') {
    const skip  = (page - 1) * limit;
    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : undefined;

    const [categories, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(name: string) {
    const existing = await this.prisma.category.findUnique({ where: { name } });
    if (existing) throw new BadRequestException(`Category "${name}" already exists`);
    return this.prisma.category.create({ data: { name } });
  }

  async update(id: string, name: string) {
    await this.findOneOrFail(id);
    const conflict = await this.prisma.category.findFirst({ where: { name, NOT: { id } } });
    if (conflict) throw new BadRequestException(`Category "${name}" already exists`);
    return this.prisma.category.update({ where: { id }, data: { name } });
  }

  async remove(id: string) {
    await this.findOneOrFail(id);

    const productCount = await this.prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      // Ensure a fallback "Uncategorized" category exists
      const fallback = await this.prisma.category.upsert({
        where: { name: 'Uncategorized' },
        update: {},
        create: { name: 'Uncategorized' },
      });
      // Reassign all products from the deleted category to the fallback
      await this.prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: fallback.id },
      });
    }

    await this.prisma.category.delete({ where: { id } });
    return { message: 'Category deleted successfully' };
  }

  private async findOneOrFail(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }
}
