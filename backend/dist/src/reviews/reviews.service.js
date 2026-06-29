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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const order = await this.prisma.order.findFirst({
            where: { id: dto.orderId, userId },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.status !== 'DELIVERED') {
            throw new common_1.BadRequestException('Reviews can only be submitted for delivered orders');
        }
        const orderItem = await this.prisma.orderItem.findFirst({
            where: { orderId: dto.orderId, productId: dto.productId },
        });
        if (!orderItem) {
            throw new common_1.BadRequestException('Product was not part of this order');
        }
        const existing = await this.prisma.review.findUnique({
            where: {
                userId_productId_orderId: {
                    userId,
                    productId: dto.productId,
                    orderId: dto.orderId,
                },
            },
        });
        if (existing)
            throw new common_1.ConflictException('You have already reviewed this product for this order');
        return this.prisma.review.create({
            data: {
                userId,
                productId: dto.productId,
                orderId: dto.orderId,
                rating: dto.rating,
                comment: dto.comment,
            },
            include: { user: { select: { firstName: true, lastName: true } } },
        });
    }
    async findByProduct(productId) {
        return this.prisma.review.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { firstName: true, lastName: true } } },
        });
    }
    async checkReviewed(userId, productId, orderId) {
        const review = await this.prisma.review.findUnique({
            where: {
                userId_productId_orderId: { userId, productId, orderId },
            },
        });
        return { reviewed: !!review, review: review ?? null };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map