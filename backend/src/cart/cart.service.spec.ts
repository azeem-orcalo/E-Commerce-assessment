import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeProduct = (overrides: Record<string, unknown> = {}) => ({
  id: 'prod-1',
  name: 'Test Widget',
  price: 10.0,
  imageUrl: null,
  stock: 5,
  deletedAt: null,
  category: { id: 'cat-1', name: 'Electronics' },
  ...overrides,
});

const CART = { id: 'cart-1', userId: 'user-1' };

const CART_ITEM = {
  id: 'item-1',
  cartId: 'cart-1',
  productId: 'prod-1',
  quantity: 2,
  chosenColor: '',
  chosenSize: '',
};

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockPrisma = {
  cart: { upsert: jest.fn(), findUnique: jest.fn() },
  product: { findFirst: jest.fn() },
  cartItem: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    jest.clearAllMocks();
  });

  // ── addItem ───────────────────────────────────────────────────────────────

  describe('addItem', () => {
    const userId = 'user-1';
    const dto = { productId: 'prod-1', quantity: 2 };

    beforeEach(() => {
      mockPrisma.product.findFirst.mockResolvedValue(makeProduct());
      mockPrisma.cart.upsert.mockResolvedValue(CART);
      mockPrisma.cartItem.findFirst.mockResolvedValue(null); // no existing variant
      mockPrisma.cartItem.create.mockResolvedValue({
        ...CART_ITEM,
        product: makeProduct(),
      });
    });

    it('creates a new cart item when the variant does not already exist', async () => {
      await service.addItem(userId, dto);
      expect(mockPrisma.cartItem.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.cartItem.update).not.toHaveBeenCalled();
    });

    it('merges quantity into an existing cart item for the same variant', async () => {
      mockPrisma.cartItem.findFirst.mockResolvedValue({ ...CART_ITEM, quantity: 1 });
      mockPrisma.cartItem.update.mockResolvedValue({
        ...CART_ITEM,
        quantity: 3,
        product: makeProduct(),
      });

      await service.addItem(userId, { ...dto, quantity: 2 });

      expect(mockPrisma.cartItem.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { quantity: 3 } }),
      );
      expect(mockPrisma.cartItem.create).not.toHaveBeenCalled();
    });

    it('throws 422 when the product has no stock', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(makeProduct({ stock: 0 }));
      await expect(service.addItem(userId, dto)).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    });

    it('throws 422 when the requested quantity exceeds available stock', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(makeProduct({ stock: 1 }));
      await expect(service.addItem(userId, { ...dto, quantity: 5 })).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    });

    it('throws NotFoundException when the product does not exist', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);
      await expect(service.addItem(userId, dto)).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateItem ────────────────────────────────────────────────────────────

  describe('updateItem', () => {
    const userId = 'user-1';
    const itemId = 'item-1';

    beforeEach(() => {
      mockPrisma.cart.findUnique.mockResolvedValue(CART);
      mockPrisma.cartItem.findFirst.mockResolvedValue(CART_ITEM);
      mockPrisma.product.findFirst.mockResolvedValue(makeProduct());
    });

    it('deletes the item and returns { deleted: true } when quantity is 0', async () => {
      mockPrisma.cartItem.delete.mockResolvedValue({});

      const result = await service.updateItem(userId, itemId, { quantity: 0 });

      expect(mockPrisma.cartItem.delete).toHaveBeenCalledWith({ where: { id: itemId } });
      expect(result).toEqual({ deleted: true });
    });

    it('updates the quantity when the value is within stock limits', async () => {
      mockPrisma.cartItem.update.mockResolvedValue({
        ...CART_ITEM,
        quantity: 3,
        product: makeProduct(),
      });

      await service.updateItem(userId, itemId, { quantity: 3 });

      expect(mockPrisma.cartItem.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { quantity: 3 } }),
      );
    });

    it('throws 422 when the new quantity exceeds product stock', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(makeProduct({ stock: 2 }));
      await expect(service.updateItem(userId, itemId, { quantity: 5 })).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    });
  });
});
