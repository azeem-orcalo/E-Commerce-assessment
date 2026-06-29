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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const stripe_1 = __importDefault(require("stripe"));
const prisma_service_1 = require("../prisma/prisma.service");
let OrdersService = class OrdersService {
    prisma;
    config;
    stripe;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        const key = this.config.get('STRIPE_SECRET_KEY');
        this.stripe = key ? new stripe_1.default(key) : null;
    }
    async checkout(userId, dto) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });
        if (!cart || cart.items.length === 0) {
            throw new common_1.BadRequestException('Cart is empty');
        }
        let originalAmount = 0;
        for (const item of cart.items) {
            if (item.product.deletedAt) {
                throw new common_1.NotFoundException(`Product "${item.product.name}" is no longer available`);
            }
            if (item.product.stock < item.quantity) {
                throw new common_1.HttpException(`Insufficient stock for "${item.product.name}"`, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
            }
            originalAmount += Number(item.product.price) * item.quantity;
        }
        const now = new Date();
        const activeOffer = await this.prisma.offer.findFirst({
            where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
            orderBy: { endDate: 'asc' },
        });
        let discountPercent = 0;
        let discountAmount = 0;
        let totalAmount = originalAmount;
        if (activeOffer) {
            discountPercent = Number(activeOffer.discountPercent);
            discountAmount = parseFloat((originalAmount * discountPercent / 100).toFixed(2));
            totalAmount = parseFloat((originalAmount - discountAmount).toFixed(2));
        }
        const discountInfo = activeOffer
            ? { discountPercent, discountAmount, originalAmount, offerTitle: activeOffer.title }
            : null;
        if (dto.paymentMethod === client_1.PaymentMethod.CARD) {
            return this.checkoutWithCard(userId, cart, originalAmount, totalAmount, discountInfo);
        }
        return this.checkoutWithCod(userId, cart, originalAmount, totalAmount, discountInfo);
    }
    async checkoutWithCod(userId, cart, originalAmount, totalAmount, discountInfo) {
        const order = await this.prisma.$transaction(async (tx) => {
            for (const item of cart.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }
            const created = await tx.order.create({
                data: {
                    userId,
                    status: 'PENDING',
                    paymentMethod: client_1.PaymentMethod.COD,
                    totalAmount,
                    originalAmount: discountInfo ? originalAmount : null,
                    discountPercent: discountInfo ? discountInfo.discountPercent : null,
                    discountAmount: discountInfo ? discountInfo.discountAmount : null,
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            priceAtPurchase: item.product.price,
                        })),
                    },
                },
                include: { items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } } },
            });
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            return created;
        });
        return {
            orderId: order.id,
            status: order.status,
            paymentMethod: order.paymentMethod,
            originalAmount: discountInfo ? originalAmount.toFixed(2) : null,
            discountPercent: discountInfo ? discountInfo.discountPercent : null,
            discountAmount: discountInfo ? discountInfo.discountAmount.toFixed(2) : null,
            offerTitle: discountInfo ? discountInfo.offerTitle : null,
            totalAmount: order.totalAmount.toString(),
            items: order.items,
        };
    }
    async checkoutWithCard(userId, cart, originalAmount, totalAmount, discountInfo) {
        if (!this.stripe) {
            throw new common_1.ServiceUnavailableException('Stripe is not configured on this server');
        }
        const amountInCents = Math.round(totalAmount * 100);
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'gbp',
            metadata: { userId },
        });
        const order = await this.prisma.$transaction(async (tx) => {
            for (const item of cart.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }
            const created = await tx.order.create({
                data: {
                    userId,
                    status: 'PENDING',
                    paymentMethod: client_1.PaymentMethod.CARD,
                    stripePaymentIntentId: paymentIntent.id,
                    totalAmount,
                    originalAmount: discountInfo ? originalAmount : null,
                    discountPercent: discountInfo ? discountInfo.discountPercent : null,
                    discountAmount: discountInfo ? discountInfo.discountAmount : null,
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            priceAtPurchase: item.product.price,
                        })),
                    },
                },
                include: { items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } } },
            });
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            return created;
        });
        return {
            orderId: order.id,
            clientSecret: paymentIntent.client_secret,
            status: order.status,
            paymentMethod: order.paymentMethod,
            originalAmount: discountInfo ? originalAmount.toFixed(2) : null,
            discountPercent: discountInfo ? discountInfo.discountPercent : null,
            discountAmount: discountInfo ? discountInfo.discountAmount.toFixed(2) : null,
            offerTitle: discountInfo ? discountInfo.offerTitle : null,
            totalAmount: order.totalAmount.toString(),
            items: order.items,
        };
    }
    async getOrders(userId) {
        const orders = await this.prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true, imageUrl: true, price: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return orders;
    }
    async getOrder(userId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true, imageUrl: true, price: true } },
                    },
                },
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map