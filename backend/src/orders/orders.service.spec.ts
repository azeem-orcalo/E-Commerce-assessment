import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod } from '@prisma/client';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeTx = () => ({
  product: { update: jest.fn().mockResolvedValue({}) },
  order: {
    create: jest.fn().mockResolvedValue({
      id: 'order-1',
      status: 'PENDING',
      paymentMethod: PaymentMethod.COD,
      totalAmount: { toString: () => '20.00' },
      originalAmount: null,
      discountPercent: null,
      discountAmount: null,
      items: [],
    }),
  },
  cartItem: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
});

const makeCart = (itemOverrides?: Record<string, unknown>[]) => ({
  id: 'cart-1',
  userId: 'user-1',
  items: itemOverrides ?? [
    {
      id: 'ci-1',
      productId: 'prod-1',
      quantity: 2,
      product: {
        id: 'prod-1',
        name: 'Widget',
        price: 10.0,
        stock: 5,
        deletedAt: null,
        imageUrl: null,
      },
    },
  ],
});

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockPrisma = {
  cart: { findUnique: jest.fn() },
  offer: { findFirst: jest.fn() },
  $transaction: jest.fn(),
};

const mockConfig = {
  get: jest.fn().mockReturnValue(null), // no Stripe key → mock payment path
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('OrdersService', () => {
  let service: OrdersService;
  let tx: ReturnType<typeof makeTx>;

  beforeEach(async () => {
    tx = makeTx();
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(
      async (cb: (t: typeof tx) => unknown) => cb(tx),
    );
    mockConfig.get.mockReturnValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  // ── checkout ──────────────────────────────────────────────────────────────

  describe('checkout', () => {
    const userId = 'user-1';
    const dto = { paymentMethod: PaymentMethod.COD };

    beforeEach(() => {
      mockPrisma.cart.findUnique.mockResolvedValue(makeCart());
      mockPrisma.offer.findFirst.mockResolvedValue(null);
    });

    it('throws BadRequestException when the cart does not exist', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(null);
      await expect(service.checkout(userId, dto)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when the cart is empty', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({ ...makeCart([]), items: [] });
      await expect(service.checkout(userId, dto)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when a cart product has been soft-deleted', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(
        makeCart([
          {
            id: 'ci-1',
            productId: 'prod-1',
            quantity: 1,
            product: {
              id: 'prod-1',
              name: 'Widget',
              price: 10.0,
              stock: 5,
              deletedAt: new Date(),
              imageUrl: null,
            },
          },
        ]),
      );
      await expect(service.checkout(userId, dto)).rejects.toThrow(NotFoundException);
    });

    it('throws 422 when a cart item quantity exceeds available stock', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(
        makeCart([
          {
            id: 'ci-1',
            productId: 'prod-1',
            quantity: 10,
            product: {
              id: 'prod-1',
              name: 'Widget',
              price: 10.0,
              stock: 3,
              deletedAt: null,
              imageUrl: null,
            },
          },
        ]),
      );
      await expect(service.checkout(userId, dto)).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    });

    it('creates the order in a transaction and returns orderId + status on COD checkout', async () => {
      const result = await service.checkout(userId, dto);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({ orderId: 'order-1', status: 'PENDING' });
    });

    it('applies discount and exposes offer info in the result when an active offer exists', async () => {
      mockPrisma.offer.findFirst.mockResolvedValue({
        id: 'offer-1',
        title: 'Summer Sale',
        discountPercent: 10,
        isActive: true,
        startDate: new Date(Date.now() - 1_000),
        endDate: new Date(Date.now() + 1_000_000),
      });

      const result = await service.checkout(userId, dto);

      expect(result.discountPercent).toBe(10);
      expect(result.offerTitle).toBe('Summer Sale');
      expect(result.discountAmount).toBeDefined();
      expect(result.originalAmount).toBeDefined();
    });
  });
});
