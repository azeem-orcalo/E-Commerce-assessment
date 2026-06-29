# Skill: Test Writing

## Purpose
Code-structure blueprints for unit and E2E testing across the five priority areas of the
ThreadCo e-commerce system. Reference these templates when writing new test files to maintain
consistent structure, mock patterns, and assertion depth.

---

## Test Runner Setup

```bash
# Unit tests (Jest)
cd backend && npm test

# Unit tests — watch mode
cd backend && npm run test:watch

# E2E tests (Jest + Supertest against real DB)
cd backend && npm run test:e2e

# Coverage report
cd backend && npm run test:cov
```

**Jest config is in `backend/package.json`:**
```json
{
  "jest": {
    "moduleFileExtensions": ["js","json","ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": { "^.+\\.(t|j)s$": "ts-jest" },
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

**E2E config is in `backend/test/jest-e2e.json`:**
```json
{
  "moduleFileExtensions": ["js","json","ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" }
}
```

---

## Priority Area 1: Auth Unit Tests

**File:** `backend/src/auth/auth.service.spec.ts`

**Setup pattern — mock all dependencies:**
```ts
const mockPrisma = { user: { create: jest.fn(), findUnique: jest.fn() } };
const mockUsersService = { findByEmail: jest.fn(), findById: jest.fn() };
const mockJwtService = { sign: jest.fn().mockReturnValue('test.jwt.token') };

beforeEach(async () => {
  const module = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: PrismaService, useValue: mockPrisma },
      { provide: UsersService, useValue: mockUsersService },
      { provide: JwtService, useValue: mockJwtService },
    ],
  }).compile();
  service = module.get<AuthService>(AuthService);
  jest.clearAllMocks();
});
```

**Must-have assertions:**
```ts
// register
it('hashes password before storing', async () => {
  // Assert: mockPrisma.user.create called with a bcrypt hash, not raw password
  const createArgs = mockPrisma.user.create.mock.calls[0][0];
  expect(await bcrypt.compare('RawPassword1!', createArgs.data.passwordHash)).toBe(true);
  expect(createArgs.data.passwordHash).not.toBe('RawPassword1!');
});

it('never returns passwordHash in response', async () => {
  const result = await service.register({ email: 'x@x.com', password: 'Pass1234!', name: 'X' });
  expect(result.user).not.toHaveProperty('passwordHash');
});

// login
it('returns 401 for unknown email without timing attack hint', async () => {
  // Both "unknown email" and "wrong password" must throw the SAME message
  // to prevent user enumeration attacks
  mockUsersService.findByEmail.mockResolvedValue(null);
  await expect(service.login({ email: 'ghost@x.com', password: 'anything' }))
    .rejects.toThrow('Invalid email or password');
});

it('returns 401 for wrong password with SAME message as unknown email', async () => {
  const hash = await bcrypt.hash('CorrectPassword1!', 10);
  mockUsersService.findByEmail.mockResolvedValue({ id: 'u1', passwordHash: hash, ...defaults });
  await expect(service.login({ email: 'user@x.com', password: 'WrongPassword!' }))
    .rejects.toThrow('Invalid email or password');  // same message — no user enumeration
});
```

---

## Priority Area 2: Cart Service Unit Tests

**File:** `backend/src/cart/cart.service.spec.ts`

**Mock shape:**
```ts
const mockPrisma = {
  cart: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  cartItem: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  product: {
    findUnique: jest.fn(),
  },
};
```

**Critical test cases:**
```ts
describe('addItem', () => {
  it('creates cart for user with no existing cart', async () => {
    mockPrisma.cart.findUnique.mockResolvedValue(null);
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', stock: 10, deletedAt: null });
    mockPrisma.cart.create.mockResolvedValue({ id: 'cart1', userId: 'u1', items: [] });
    await service.addItem('u1', { productId: 'p1', quantity: 2 });
    expect(mockPrisma.cart.create).toHaveBeenCalledWith({
      data: { userId: 'u1', items: { create: { productId: 'p1', quantity: 2 } } },
    });
  });

  it('increments quantity when product already in cart', async () => {
    const existingItem = { id: 'ci1', quantity: 3, productId: 'p1', cartId: 'cart1' };
    mockPrisma.cart.findUnique.mockResolvedValue({
      id: 'cart1', items: [existingItem],
    });
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', stock: 10, deletedAt: null });
    await service.addItem('u1', { productId: 'p1', quantity: 2 });
    // Total would be 5, which is ≤ 10 stock — should update to 5
    expect(mockPrisma.cartItem.update).toHaveBeenCalledWith({
      where: { id: 'ci1' },
      data: { quantity: 5 },
    });
  });

  it('throws 422 when requested total quantity exceeds stock', async () => {
    mockPrisma.cart.findUnique.mockResolvedValue({ id: 'cart1', items: [] });
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', stock: 3, deletedAt: null, name: 'Test Tee' });
    try {
      await service.addItem('u1', { productId: 'p1', quantity: 5 });
      fail('Should have thrown');
    } catch (e) {
      expect(e.getStatus()).toBe(422);
    }
  });

  it('throws 404 when product does not exist or is soft-deleted', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);
    await expect(service.addItem('u1', { productId: 'nonexistent', quantity: 1 }))
      .rejects.toThrow(NotFoundException);
  });
});
```

---

## Priority Area 3: Order Service Unit Tests

**File:** `backend/src/orders/orders.service.spec.ts`

**Transaction mock pattern:**
```ts
// Prisma $transaction mock — executes the callback synchronously
mockPrisma.$transaction = jest.fn().mockImplementation((cb) => cb(mockPrisma));
```

**Critical test cases:**
```ts
describe('checkout', () => {
  it('calculates totalAmount from priceAtPurchase × quantity', async () => {
    // Cart: item A ($10 × 2) + item B ($25 × 1) = $45.00
    const mockCart = {
      items: [
        { productId: 'p1', quantity: 2, product: { price: '10.00', stock: 10, name: 'Tee' } },
        { productId: 'p2', quantity: 1, product: { price: '25.00', stock: 5, name: 'Chinos' } },
      ],
    };
    mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
    mockPrisma.order.create.mockResolvedValue({ id: 'ord1', totalAmount: '45.00' });

    const result = await service.checkout('u1', { paymentMethod: 'mock' });
    const createCall = mockPrisma.order.create.mock.calls[0][0];
    expect(createCall.data.totalAmount).toBe('45.00');
  });

  it('snapshots priceAtPurchase from cart item product.price, not a recalculated value', async () => {
    // Even if we change product.price after adding to cart, priceAtPurchase = original price
    const createCall = mockPrisma.order.create.mock.calls[0][0];
    const item = createCall.data.items.create[0];
    expect(item.priceAtPurchase).toBe('10.00');  // snapshot from cart, not re-fetched
  });

  it('decrements stock for each cart item', async () => {
    await service.checkout('u1', {});
    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { stock: { decrement: 2 } },
    });
    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 'p2' },
      data: { stock: { decrement: 1 } },
    });
  });

  it('throws 422 and does not create order when any item has insufficient stock', async () => {
    const mockCart = {
      items: [
        { productId: 'p1', quantity: 10, product: { price: '10.00', stock: 3, name: 'Tee' } },
      ],
    };
    mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
    try {
      await service.checkout('u1', {});
      fail('Should have thrown');
    } catch (e) {
      expect(e.getStatus()).toBe(422);
      expect(e.message).toContain('Tee');
    }
    expect(mockPrisma.order.create).not.toHaveBeenCalled();
  });

  it('clears the cart after successful order creation', async () => {
    // ... setup successful checkout
    expect(mockPrisma.cart.update).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      data: { items: { deleteMany: {} } },
    });
  });

  it('throws 400 when cart is empty', async () => {
    mockPrisma.cart.findUnique.mockResolvedValue({ items: [] });
    await expect(service.checkout('u1', {})).rejects.toThrow(BadRequestException);
  });
});
```

---

## Priority Area 4: Product List E2E

**File:** `backend/test/products.e2e-spec.ts`

**Full app bootstrap with real DB:**
```ts
let app: INestApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.init();
});

afterAll(async () => { await app.close(); });
```

**Assertions that must pass:**
```ts
it('GET /api/products — returns data + meta envelope', async () => {
  const { body } = await request(app.getHttpServer()).get('/api/products').expect(200);
  expect(body).toHaveProperty('data');
  expect(body).toHaveProperty('meta');
  expect(body.meta).toHaveProperty('page', 1);
  expect(body.meta).toHaveProperty('limit');
  expect(body.meta).toHaveProperty('total');
  expect(body.data).toBeInstanceOf(Array);
});

it('each product has required fields', async () => {
  const { body } = await request(app.getHttpServer()).get('/api/products').expect(200);
  if (body.data.length > 0) {
    const p = body.data[0];
    expect(p).toHaveProperty('id');
    expect(p).toHaveProperty('name');
    expect(p).toHaveProperty('price');
    expect(p).toHaveProperty('stock');
    expect(p).toHaveProperty('category');
    expect(p.category).toHaveProperty('id');
    expect(p.category).toHaveProperty('name');
    expect(p).not.toHaveProperty('passwordHash');
    expect(p).not.toHaveProperty('deletedAt');  // omit from public response
  }
});

it('?search= filters by name case-insensitively', async () => {
  const { body } = await request(app.getHttpServer())
    .get('/api/products?search=tee')
    .expect(200);
  body.data.forEach((p: any) => {
    expect(p.name.toLowerCase()).toContain('tee');
  });
});

it('?page=2&limit=3 returns correct slice', async () => {
  const { body: page1 } = await request(app.getHttpServer())
    .get('/api/products?page=1&limit=3').expect(200);
  const { body: page2 } = await request(app.getHttpServer())
    .get('/api/products?page=2&limit=3').expect(200);
  // No product from page 1 should appear on page 2
  const page1Ids = new Set(page1.data.map((p: any) => p.id));
  page2.data.forEach((p: any) => expect(page1Ids.has(p.id)).toBe(false));
});
```

---

## Priority Area 5: Admin Guard E2E

**File:** `backend/test/admin-guard.e2e-spec.ts`

**Token fixture pattern:**
```ts
let customerToken: string;
let adminToken: string;

beforeAll(async () => {
  // ... bootstrap app

  // Get customer token
  const cRes = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email: 'customer@store.com', password: 'Customer1234!' });
  customerToken = cRes.body.accessToken;

  // Get admin token
  const aRes = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email: 'admin@store.com', password: 'Admin1234!' });
  adminToken = aRes.body.accessToken;
});

it('customer token → 403 on GET /api/admin/dashboard/stats', async () => {
  await request(app.getHttpServer())
    .get('/api/admin/dashboard/stats')
    .set('Authorization', `Bearer ${customerToken}`)
    .expect(403);
});

it('no token → 401 on GET /api/admin/dashboard/stats', async () => {
  await request(app.getHttpServer())
    .get('/api/admin/dashboard/stats')
    .expect(401);
});

it('admin token → 200 on GET /api/admin/dashboard/stats', async () => {
  await request(app.getHttpServer())
    .get('/api/admin/dashboard/stats')
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);
});

it('customer token → 403 on POST /api/products', async () => {
  await request(app.getHttpServer())
    .post('/api/products')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ name: 'Hack', description: 'x', price: '1.00', stock: 1, categoryId: 'any' })
    .expect(403);
});
```

---

## Common Mock Helpers (test/helpers/mock-prisma.ts)

```ts
export const createMockPrismaService = () => ({
  $transaction: jest.fn().mockImplementation((cb) => cb(this)),
  user:    { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  product: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  cart:    { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  cartItem:{ findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
  order:   { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  orderItem: { create: jest.fn() },
  category: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
});
```

---

## Assertion Depth Guidelines

| Assertion type | Use when |
|---|---|
| `expect(x).toBe(y)` | Primitive equality (strings, numbers, booleans) |
| `expect(x).toEqual(y)` | Deep object equality |
| `expect(x).toMatchObject(y)` | Partial object match (y is a subset of x) |
| `expect(x).toHaveProperty('key', value)` | Response shape validation |
| `expect(x).not.toHaveProperty('key')` | Security — passwordHash never in response |
| `expect(fn).rejects.toThrow('message')` | Exception text matching |
| `expect(mock).toHaveBeenCalledWith(args)` | Verify DB calls had correct arguments |
| `expect(mock).not.toHaveBeenCalled()` | Rollback verification — no writes on error |

Always prefer `toMatchObject` over `toEqual` for response bodies — it's resilient to
future fields being added without breaking existing tests.
