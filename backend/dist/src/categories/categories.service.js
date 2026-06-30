"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(page = 1, limit = 10, search = '') {
        const skip = (page - 1) * limit;
        const where = search
            ? { name: { contains: search, mode: 'insensitive' } }
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
    async create(name) {
        const existing = await this.prisma.category.findUnique({ where: { name } });
        if (existing)
            throw new common_1.BadRequestException(`Category "${name}" already exists`);
        return this.prisma.category.create({ data: { name } });
    }
    async update(id, name) {
        await this.findOneOrFail(id);
        const conflict = await this.prisma.category.findFirst({ where: { name, NOT: { id } } });
        if (conflict)
            throw new common_1.BadRequestException(`Category "${name}" already exists`);
        return this.prisma.category.update({ where: { id }, data: { name } });
    }
    async remove(id) {
        await this.findOneOrFail(id);
        const productCount = await this.prisma.product.count({ where: { categoryId: id } });
        if (productCount > 0) {
            const fallback = await this.prisma.category.upsert({
                where: { name: 'Uncategorized' },
                update: {},
                create: { name: 'Uncategorized' },
            });
            await this.prisma.product.updateMany({
                where: { categoryId: id },
                data: { categoryId: fallback.id },
            });
        }
        await this.prisma.category.delete({ where: { id } });
        return { message: 'Category deleted successfully' };
    }
    async findOneOrFail(id) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException(`Category ${id} not found`);
        return category;
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map