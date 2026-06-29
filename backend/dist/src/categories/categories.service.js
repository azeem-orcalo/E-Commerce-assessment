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
    findAll() {
        return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
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
        const productCount = await this.prisma.product.count({ where: { categoryId: id, deletedAt: null } });
        if (productCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete category — ${productCount} product(s) are still assigned to it.`);
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