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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrders(page, limit, status) {
        const where = status ? { status } : {};
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true } },
                    items: {
                        include: {
                            product: { select: { id: true, name: true, imageUrl: true } },
                        },
                    },
                },
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            data: orders,
            meta: { page, limit, total },
        };
    }
    async updateOrderStatus(orderId, status) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (status === client_1.OrderStatus.CANCELLED && order.status !== client_1.OrderStatus.CANCELLED) {
            await this.prisma.$transaction(async (tx) => {
                for (const item of order.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } },
                    });
                }
                await tx.order.update({ where: { id: orderId }, data: { status } });
            });
        }
        else {
            await this.prisma.order.update({ where: { id: orderId }, data: { status } });
        }
        return this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
                items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
            },
        });
    }
    async getDashboardStats() {
        const [totalRevenue, ordersByStatus, topProducts, totalOrders, activeProducts] = await Promise.all([
            this.prisma.order.aggregate({
                where: { status: { in: [client_1.OrderStatus.DELIVERED, client_1.OrderStatus.SHIPPED] } },
                _sum: { totalAmount: true },
            }),
            this.prisma.order.groupBy({
                by: ['status'],
                _count: { id: true },
            }),
            this.prisma.orderItem.groupBy({
                by: ['productId'],
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5,
            }),
            this.prisma.order.count(),
            this.prisma.product.count({ where: { stock: { gt: 0 } } }),
        ]);
        const productIds = topProducts.map((p) => p.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, imageUrl: true, price: true },
        });
        const productMap = new Map(products.map((p) => [p.id, p]));
        return {
            totalRevenue: Number(totalRevenue._sum.totalAmount ?? 0),
            totalOrders,
            activeStock: activeProducts,
            ordersByStatus: ordersByStatus.map((o) => ({
                status: o.status,
                count: o._count.id,
            })),
            topProducts: topProducts.map((tp) => ({
                product: productMap.get(tp.productId),
                totalSold: tp._sum.quantity ?? 0,
            })),
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map