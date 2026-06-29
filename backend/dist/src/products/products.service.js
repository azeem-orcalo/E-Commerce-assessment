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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const query_products_dto_1 = require("./dto/query-products.dto");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { search, categoryId, minPrice, maxPrice, sortBy = query_products_dto_1.ProductSortBy.FEATURED, page = 1, limit = 12, } = query;
        const where = {
            deletedAt: null,
            ...(search && { name: { contains: search, mode: 'insensitive' } }),
            ...(categoryId && { categoryId }),
            ...((minPrice !== undefined || maxPrice !== undefined) && {
                price: {
                    ...(minPrice !== undefined && { gte: new client_1.Prisma.Decimal(minPrice) }),
                    ...(maxPrice !== undefined && { lte: new client_1.Prisma.Decimal(maxPrice) }),
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
    async findOne(id) {
        const product = await this.prisma.product.findFirst({
            where: { id, deletedAt: null },
            include: { category: { select: { id: true, name: true } } },
        });
        if (!product)
            throw new common_1.NotFoundException(`Product ${id} not found`);
        return product;
    }
    resolveOrderBy(sortBy) {
        switch (sortBy) {
            case query_products_dto_1.ProductSortBy.BEST_SELLER:
                return { orderItems: { _count: 'desc' } };
            case query_products_dto_1.ProductSortBy.PRICE_ASC:
                return { price: 'asc' };
            case query_products_dto_1.ProductSortBy.PRICE_DESC:
                return { price: 'desc' };
            case query_products_dto_1.ProductSortBy.NEWEST:
                return { createdAt: 'desc' };
            case query_products_dto_1.ProductSortBy.FEATURED:
            default:
                return { createdAt: 'desc' };
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map