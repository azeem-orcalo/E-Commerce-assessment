import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

const PRODUCT_SELECT = {
  id: true,
  name: true,
  price: true,
  imageUrl: true,
  stock: true,
  category: { select: { id: true, name: true } },
} as const;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // ── helpers ──────────────────────────────────────────────────────────────────

  private async getOrCreateCart(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  private async getProduct(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);
    return product;
  }

  private async getOwnedCartItem(userId: string, itemId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('Cart item not found');

    return { cart, item };
  }

  // ── public API ───────────────────────────────────────────────────────────────

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: { select: PRODUCT_SELECT } },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!cart) return { items: [], total: '0.00' };

    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    return { ...cart, total: total.toFixed(2) };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const {
      productId,
      quantity,
      chosenColor = '',
      chosenSize = '',
    } = dto;

    const product = await this.getProduct(productId);

    if (product.stock <= 0) {
      throw new HttpException(
        `"${product.name}" is out of stock`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const cart = await this.getOrCreateCart(userId);

    // Find an existing line with the exact same variant combination
    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, chosenColor, chosenSize },
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock) {
        throw new HttpException(
          `Only ${product.stock - existing.quantity} more unit(s) available for this variant`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
        include: { product: { select: PRODUCT_SELECT } },
      });
    }

    if (quantity > product.stock) {
      throw new HttpException(
        `Only ${product.stock} unit(s) available`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return this.prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity, chosenColor, chosenSize },
      include: { product: { select: PRODUCT_SELECT } },
    });
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const { cart, item } = await this.getOwnedCartItem(userId, itemId);
    void cart; // ownership verified

    if (dto.quantity === 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
      return { deleted: true };
    }

    const product = await this.getProduct(item.productId);

    if (dto.quantity > product.stock) {
      throw new HttpException(
        `Only ${product.stock} unit(s) available`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
      include: { product: { select: PRODUCT_SELECT } },
    });
  }

  async removeItem(userId: string, itemId: string) {
    await this.getOwnedCartItem(userId, itemId); // ownership check
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return { deleted: true };
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) return { deleted: 0 };

    const { count } = await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
    return { deleted: count };
  }
}
