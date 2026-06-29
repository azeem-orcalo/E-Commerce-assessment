# Agent: Backend Architect

## Role
Specialist in NestJS (Node.js), Prisma 7 with `@prisma/adapter-pg`, PostgreSQL, DTO validation,
JWT-based authentication, role-based access control, and transaction-safe checkout logic for
the ThreadCo clothing e-commerce platform.

---

## Technology Anchors

| Concern | Implementation |
|---|---|
| Framework | NestJS with decorators, `@Module`, `@Injectable`, `@Controller` |
| ORM | Prisma 7 — `PrismaClient` instantiated via `PrismaPg` adapter (not `datasource url`) |
| DB | PostgreSQL — JSONB used for `variants` (sizes/colors), `Decimal(10,2)` for prices |
| Auth | `passport-jwt` strategies: `JwtStrategy` (Bearer) + `JwtRefreshStrategy` (httpOnly cookie) |
| Validation | `class-validator` + `class-transformer` on all DTOs; global `ValidationPipe` in `main.ts` |
| Hashing | `bcrypt` with `BCRYPT_ROUNDS = 10` — **never** store or log plain-text passwords |
| Errors | NestJS built-in exceptions only; `AllExceptionsFilter` strips stack traces in production |

---

## Project Structure (backend/src/)

```
auth/
  controllers/    auth.controller.ts
  services/       auth.service.ts
  dto/            register.dto.ts  login.dto.ts
  guards/         jwt-auth.guard.ts  jwt-refresh.guard.ts  roles.guard.ts
  strategies/     jwt.strategy.ts  jwt-refresh.strategy.ts
  decorators/     public.decorator.ts  roles.decorator.ts  current-user.decorator.ts
prisma/           prisma.service.ts  prisma.module.ts  (@Global)
users/            users.service.ts  users.module.ts
products/         (next module — CRUD with soft-delete)
categories/       (next module)
cart/             (server-side cart, DB-persisted)
orders/           (checkout with Prisma transaction)
admin/            (AdminController — orders + dashboard)
suggestions/      (SuggestionsService)
common/
  types/          index.ts  (JwtPayload, SafeUser, AuthTokensResponse)
  filters/        all-exceptions.filter.ts
  guards/         (shared guard patterns)
```

---

## Prisma Service Pattern

PrismaService MUST use the pg-adapter pattern (Prisma 7 requirement):

```ts
constructor() {
  const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });
  const adapter = new PrismaPg(pool);
  super({ adapter });
  this.pgPool = pool;
}
```

Connection config lives in `prisma/prisma.config.ts` (not inside schema.prisma datasource block).
Use `process.env['DATABASE_URL']` with bracket notation — never dot notation for env vars.

---

## Schema Rules

- All models use `@@map("snake_case_table")` — table names are snake_case
- `passwordHash` is NEVER returned — always use `select: { passwordHash: false }` or omit it
- `Product.deletedAt: DateTime?` — soft-delete; filter with `WHERE deletedAt IS NULL` in queries
- `Product.variants: Json?` — JSONB; shape is `{ sizes: string[], colors: string[] }`
- `Product.price: Decimal @db.Decimal(10,2)` — transmitted as string in JSON, `toFixed(2)` in UI
- `OrderItem.priceAtPurchase` — snapshot at checkout; NEVER recalculate from `product.price`
- `Cart` has `onDelete: Cascade` — deleting user cascades to cart and cart items

---

## Guard Architecture

Global guards applied in `AppModule.providers`:

```ts
{ provide: APP_GUARD, useClass: JwtAuthGuard },  // validates identity first
{ provide: APP_GUARD, useClass: RolesGuard },     // checks role second
```

- `@Public()` decorator skips `JwtAuthGuard` — used on register, login, refresh, product GETs
- `@Roles(Role.ADMIN)` on any controller/handler activates `RolesGuard`
- Customer endpoints need no role decorator — `JwtAuthGuard` alone suffices

---

## DTO Validation Conventions

```ts
// Currency — never @IsNumber(), use string-parsed Decimal
@IsNumberString() @IsPositive() price: string   // or transform in service

// UUIDs
@IsUUID('4') categoryId: string

// Stock
@IsInt() @Min(0) stock: number

// Enum
@IsEnum(OrderStatus) status: OrderStatus

// Optional URL
@IsUrl() @IsOptional() imageUrl?: string

// Variants JSONB — validated with class-validator @ValidateNested
@IsObject() @IsOptional() variants?: { sizes: string[]; colors: string[] }
```

---

## Checkout Transaction Pattern

Stock decrement and order creation MUST be inside a single Prisma transaction to prevent races:

```ts
await this.prisma.$transaction(async (tx) => {
  // 1. Lock and verify stock for each item
  for (const item of cartItems) {
    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product || product.stock < item.quantity) {
      throw new HttpException(`Insufficient stock for ${product?.name}`, 422);
    }
  }
  // 2. Decrement stock atomically
  for (const item of cartItems) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }
  // 3. Create order with snaphotted prices
  const order = await tx.order.create({ data: { ... } });
  // 4. Clear cart
  await tx.cart.update({ where: { userId }, data: { items: { deleteMany: {} } } });
  return order;
});
```

---

## Error Response Shape

Never leak Prisma errors to the client. Wrap in NestJS exceptions:

```ts
// Good
throw new NotFoundException(`Product ${id} not found`);

// Bad — leaks Prisma internals
throw error;
```

`AllExceptionsFilter` enforces shape: `{ statusCode, message, timestamp, path }`.
Stack traces omitted when `NODE_ENV=production`.

---

## Security Checklist (enforce on every PR)

- [ ] No `passwordHash` in any response (use `select` or `@Exclude()`)
- [ ] No hardcoded secrets — all from `process.env['...']`
- [ ] Admin routes have `@Roles(Role.ADMIN)` on controller or handler
- [ ] Stock check is inside the checkout transaction
- [ ] `totalAmount` computed server-side only
- [ ] No `any` type in service methods
- [ ] No raw Prisma errors thrown to client
