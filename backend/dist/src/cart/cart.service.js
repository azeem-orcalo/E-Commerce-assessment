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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const PRODUCT_SELECT = {
    id: true,
    name: true,
    price: true,
    imageUrl: true,
    stock: true,
    category: { select: { id: true, name: true } },
};
let CartService = class CartService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateCart(userId) {
        return this.prisma.cart.upsert({
            where: { userId },
            create: { userId },
            update: {},
        });
    }
    async getProduct(productId) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, deletedAt: null },
        });
        if (!product)
            throw new common_1.NotFoundException(`Product ${productId} not found`);
        return product;
    }
    async getOwnedCartItem(userId, itemId) {
        const cart = await this.prisma.cart.findUnique({ where: { userId } });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        const item = await this.prisma.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id },
        });
        if (!item)
            throw new common_1.NotFoundException('Cart item not found');
        return { cart, item };
    }
    async getCart(userId) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { product: { select: PRODUCT_SELECT } },
                    orderBy: { id: 'asc' },
                },
            },
        });
        if (!cart)
            return { items: [], total: '0.00' };
        const total = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
        return { ...cart, total: total.toFixed(2) };
    }
    async addItem(userId, dto) {
        const { productId, quantity, chosenColor = '', chosenSize = '', } = dto;
        const product = await this.getProduct(productId);
        if (product.stock <= 0) {
            throw new common_1.HttpException(`"${product.name}" is out of stock`, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const cart = await this.getOrCreateCart(userId);
        const existing = await this.prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId, chosenColor, chosenSize },
        });
        if (existing) {
            const newQty = existing.quantity + quantity;
            if (newQty > product.stock) {
                throw new common_1.HttpException(`Only ${product.stock - existing.quantity} more unit(s) available for this variant`, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
            }
            return this.prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity: newQty },
                include: { product: { select: PRODUCT_SELECT } },
            });
        }
        if (quantity > product.stock) {
            throw new common_1.HttpException(`Only ${product.stock} unit(s) available`, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        return this.prisma.cartItem.create({
            data: { cartId: cart.id, productId, quantity, chosenColor, chosenSize },
            include: { product: { select: PRODUCT_SELECT } },
        });
    }
    async updateItem(userId, itemId, dto) {
        const { cart, item } = await this.getOwnedCartItem(userId, itemId);
        void cart;
        if (dto.quantity === 0) {
            await this.prisma.cartItem.delete({ where: { id: itemId } });
            return { deleted: true };
        }
        const product = await this.getProduct(item.productId);
        if (dto.quantity > product.stock) {
            throw new common_1.HttpException(`Only ${product.stock} unit(s) available`, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        return this.prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity: dto.quantity },
            include: { product: { select: PRODUCT_SELECT } },
        });
    }
    async removeItem(userId, itemId) {
        await this.getOwnedCartItem(userId, itemId);
        await this.prisma.cartItem.delete({ where: { id: itemId } });
        return { deleted: true };
    }
    async clearCart(userId) {
        const cart = await this.prisma.cart.findUnique({ where: { userId } });
        if (!cart)
            return { deleted: 0 };
        const { count } = await this.prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });
        return { deleted: count };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map