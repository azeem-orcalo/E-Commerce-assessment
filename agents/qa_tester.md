# Agent: QA Tester

## Role
Specialist in rigorous data validation, edge-case enumeration (stock depletion races, price
snapshots, concurrent cart mutations), error response safety analysis, and writing Jest unit
tests + Supertest E2E tests for the ThreadCo e-commerce platform.

---

## Test Priority Areas (from CLAUDE.md §10)

1. **Auth unit tests** — register hashes password, login returns JWT, wrong password → 401
2. **Cart service unit tests** — add item, update quantity, enforce stock ceiling
3. **Order service unit tests** — correct total, stock decrement, 422 on insufficient stock
4. **Product list E2E** — GET /products with filter/sort/pagination returns correct shape
5. **Admin guard E2E** — customer JWT on admin endpoint → 403

---

## Test File Locations

```
backend/
  src/
    auth/
      auth.service.spec.ts      # Unit — register, login, token building
    cart/
      cart.service.spec.ts      # Unit — add, update, remove, stock ceiling
    orders/
      orders.service.spec.ts    # Unit — checkout total, stock, 422
  test/
    products.e2e-spec.ts        # E2E — GET /products with filters
    admin-guard.e2e-spec.ts     # E2E — 403 on customer hitting admin route
    auth.e2e-spec.ts            # E2E — register → login → refresh cycle
```

---

## Unit Test Blueprint — AuthService

```ts
// auth.service.spec.ts
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const mockUsersService = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
};
const mockPrisma = {
  user: { create: jest.fn() },
};
const mockJwt = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('stores a bcrypt hash, not plain-text password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u1', email: 'test@test.com', name: 'Test', role: 'CUSTOMER', createdAt: new Date(), updatedAt: new Date(),
      });

      await service.register({ email: 'test@test.com', password: 'Password123!', name: 'Test' });

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      const storedHash = createCall.data.passwordHash;
      expect(storedHash).not.toBe('Password123!');
      expect(await bcrypt.compare('Password123!', storedHash)).toBe(true);
    });

    it('throws ConflictException if email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'u1', email: 'test@test.com' });
      await expect(
        service.register({ email: 'test@test.com', password: 'Password123!', name: 'Test' }),
      ).rejects.toThrow('Email is already registered');
    });
  });

  describe('login', () => {
    it('returns tokens on valid credentials', async () => {
      const hash = await bcrypt.hash('Password123!', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'u1', email: 'test@test.com', passwordHash: hash,
        name: 'Test', role: 'CUSTOMER', createdAt: new Date(), updatedAt: new Date(),
      });
      const result = await service.login({ email: 'test@test.com', password: 'Password123!' });
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('throws UnauthorizedException on wrong password', async () => {
      const hash = await bcrypt.hash('CorrectPassword!', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'u1', email: 'test@test.com', passwordHash: hash, name: 'Test', role: 'CUSTOMER',
        createdAt: new Date(), updatedAt: new Date(),
      });
      await expect(
        service.login({ email: 'test@test.com', password: 'WrongPassword!' }),
      ).rejects.toThrow('Invalid email or password');
    });

    it('throws UnauthorizedException on unknown email', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'ghost@test.com', password: 'anything' }),
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
```

---

## Unit Test Blueprint — CartService

```ts
// cart.service.spec.ts
describe('CartService', () => {
  describe('addItem', () => {
    it('merges quantity when product already in cart', async () => { ... });
    it('throws 422 when requested quantity exceeds stock', async () => { ... });
    it('creates new cart if user has none', async () => { ... });
  });

  describe('updateItemQuantity', () => {
    it('throws 404 when product not in cart', async () => { ... });
    it('throws 422 when new quantity exceeds available stock', async () => { ... });
  });

  describe('removeItem', () => {
    it('removes only the specified product, leaves others', async () => { ... });
  });
});
```

Key assertion — stock ceiling on add:
```ts
it('throws 422 when quantity exceeds stock', async () => {
  mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', stock: 3, deletedAt: null });
  await expect(
    service.addItem('user1', { productId: 'p1', quantity: 5 }),
  ).rejects.toThrow(HttpException);
  // Verify the status code specifically
  try {
    await service.addItem('user1', { productId: 'p1', quantity: 5 });
  } catch (e) {
    expect(e.getStatus()).toBe(422);
  }
});
```

---

## Unit Test Blueprint — OrderService

```ts
describe('OrderService', () => {
  describe('checkout', () => {
    it('calculates totalAmount from priceAtPurchase, not current product.price', async () => {
      // Setup cart with 2 items: product A (price $10, qty 2), product B (price $25, qty 1)
      // Expected total: (10 * 2) + (25 * 1) = $45.00
      // Even if product.price changes between add-to-cart and checkout, total uses snapshot
    });

    it('decrements stock for each ordered item', async () => {
      // Verify tx.product.update called with { data: { stock: { decrement: qty } } } for each
    });

    it('throws 422 with product name when stock is insufficient', async () => {
      // Cart has qty=5 for a product with stock=3
      // Expect: HttpException('Insufficient stock for <name>', 422)
    });

    it('clears the cart after successful order', async () => {
      // Verify tx.cart.update called with { data: { items: { deleteMany: {} } } }
    });

    it('rolls back the transaction if any stock decrement fails', async () => {
      // If tx throws mid-way, no order should be created and no stock decremented
      // Verify prisma.$transaction mock captures all-or-nothing behavior
    });
  });
});
```

---

## E2E Test Blueprint — Product List

```ts
// test/products.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('GET /api/products (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(() => app.close());

  it('returns paginated products with default params', async () => {
    const res = await request(app.getHttpServer()).get('/api/products').expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toMatchObject({ page: 1, limit: 12 });
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('filters by categoryId', async () => {
    const cats = await request(app.getHttpServer()).get('/api/categories');
    const categoryId = cats.body.data[0].id;
    const res = await request(app.getHttpServer())
      .get(`/api/products?categoryId=${categoryId}`)
      .expect(200);
    res.body.data.forEach((p: any) => {
      expect(p.category.id).toBe(categoryId);
    });
  });

  it('filters by price range', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/products?minPrice=20&maxPrice=50')
      .expect(200);
    res.body.data.forEach((p: any) => {
      const price = parseFloat(p.price);
      expect(price).toBeGreaterThanOrEqual(20);
      expect(price).toBeLessThanOrEqual(50);
    });
  });

  it('sorts by price ascending', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/products?sortBy=price&order=asc')
      .expect(200);
    const prices = res.body.data.map((p: any) => parseFloat(p.price));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('never returns passwordHash in product response', async () => {
    const res = await request(app.getHttpServer()).get('/api/products').expect(200);
    const json = JSON.stringify(res.body);
    expect(json).not.toContain('passwordHash');
  });
});
```

---

## E2E Test Blueprint — Admin Guard

```ts
// test/admin-guard.e2e-spec.ts
describe('Admin Guard (e2e)', () => {
  let customerToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Login as customer
    const customerRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'customer@store.com', password: 'Customer1234!' });
    customerToken = customerRes.body.accessToken;

    // Login as admin
    const adminRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@store.com', password: 'Admin1234!' });
    adminToken = adminRes.body.accessToken;
  });

  it('returns 403 when customer hits admin dashboard', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/dashboard/stats')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
  });

  it('returns 401 when no token hits admin endpoint', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/dashboard/stats')
      .expect(401);
  });

  it('returns 200 when admin hits admin dashboard', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});
```

---

## Edge Cases to Cover (Regression List)

| Scenario | Expected behaviour | Test type |
|---|---|---|
| Register with existing email | 409 Conflict | Unit |
| Login with wrong password | 401 Unauthorised | Unit |
| Add product with stock=0 to cart | 422 Unprocessable | Unit |
| Checkout with qty > stock | 422, transaction rolled back | Unit |
| Customer calls POST /products | 403 Forbidden | E2E |
| GET /products with invalid page=-1 | 400 Bad Request | E2E |
| GET /products with maxPrice < minPrice | empty array or 400 | E2E |
| Order status DELIVERED → PENDING | 400 (invalid transition) | Unit |
| Soft-deleted product in cart at checkout | 422 product unavailable | Unit |
| Cancel order → stock restored per item | stock += qty for each line | Unit |
| Response body contains passwordHash | Never | E2E (regex check) |
| JWT with expired signature | 401 | E2E |

---

## Test Database Setup

Unit tests: mock `PrismaService` with `jest.fn()` — no real DB.
E2E tests: use a real test database (`DATABASE_URL_TEST` env var) seeded before each suite.

```bash
# Run before E2E suite
DATABASE_URL=$DATABASE_URL_TEST npx prisma migrate deploy
DATABASE_URL=$DATABASE_URL_TEST npx prisma db seed
```

Or use `beforeAll` in the test suite to call the seed function directly.
Never run E2E tests against the production or development database.
