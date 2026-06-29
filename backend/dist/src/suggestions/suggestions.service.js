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
exports.SuggestionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
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
};
let SuggestionsService = class SuggestionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSuggestions(userId, limit = 8) {
        const orders = await this.prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    select: { productId: true, product: { select: { categoryId: true } } },
                },
            },
        });
        const orderedProductIds = new Set();
        const purchasedCategoryIds = new Set();
        for (const order of orders) {
            for (const item of order.items) {
                orderedProductIds.add(item.productId);
                purchasedCategoryIds.add(item.product.categoryId);
            }
        }
        if (purchasedCategoryIds.size === 0) {
            return this.getPopular(limit);
        }
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
    async getPopular(limit = 8) {
        const topItems = await this.prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: limit * 3,
        });
        if (topItems.length === 0) {
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
        const rankMap = new Map(rankedIds.map((id, i) => [id, i]));
        products.sort((a, b) => (rankMap.get(a.id) ?? 999) - (rankMap.get(b.id) ?? 999));
        return products;
    }
};
exports.SuggestionsService = SuggestionsService;
exports.SuggestionsService = SuggestionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuggestionsService);
//# sourceMappingURL=suggestions.service.js.map