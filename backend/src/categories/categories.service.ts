import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
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
    const productCount = await this.prisma.product.count({ where: { categoryId: id, deletedAt: null } });
    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category — ${productCount} product(s) are still assigned to it.`,
      );
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
