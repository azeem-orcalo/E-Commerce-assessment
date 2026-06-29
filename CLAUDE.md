# CLAUDE.md — Mini E-Commerce Platform: Operational Source of Truth

This file is the primary context document for all agentic work on this project.
Read it at the start of every session. All architectural decisions, conventions, and checklists live here.

---

## 1. Project Overview

A full-stack e-commerce platform with:
- **Customer Storefront** — product catalog, cart, checkout, order history, product suggestions
- **Admin Panel** — product CRUD, order management, analytics dashboard
- **Shared NestJS API** backing both sides
- **Timed assessment** (~5–6 hours). Working over polished. Coherent over complete.

---

## 2. Technology Stack

| Layer        | Choice               | Reason                                                        |
|--------------|----------------------|---------------------------------------------------------------|
| Backend      | NestJS (Node.js)     | Matches assessment suggestion; decorators suit class-validator |
| Frontend     | Next.js 14 (App Router) | SSR/SSG for catalog; React for cart/checkout interactions   |
| Database     | PostgreSQL            | Relational integrity for orders, stock, users                 |
| ORM          | Prisma               | Type-safe queries, migrations, easy seeding                   |
| Auth         | JWT (access + refresh) | Stateless; fits separate storefront and admin clients       |
| Password hash | bcrypt              | Never store plain-text passwords                              |
| Validation   | class-validator + class-transformer | Pipe-based; used on all DTOs        |
| Payments     | Stripe test mode (or clearly-mocked fallback) | Documented below  |
| Testing      | Jest + Supertest     | NestJS default; E2E and unit                                  |
| Styling      | Tailwind CSS         | Rapid, consistent design system                               |
| Charts       | Recharts             | Lightweight; works inside Next.js App Router                  |
| File uploads  | Local disk OR Cloudinary URL | Documented in assumptions section                   |

---

## 3. Monorepo Structure

```
/
├── backend/          # NestJS app
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── admin/
│   │   ├── suggestions/
│   │   ├── common/        # guards, filters, interceptors, pipes, decorators
│   │   ├── prisma/        # PrismaService
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── test/              # E2E tests
│   └── .env.example
├── frontend/         # Next.js app
│   ├── app/
│   │   ├── (storefront)/  # public-facing pages
│   │   ├── (auth)/        # login, signup
│   │   ├── (account)/     # cart, orders (protected)
│   │   └── admin/         # admin panel (protected)
│   ├── components/
│   ├── lib/               # API client, auth helpers
│   └── .env.local.example
├── CLAUDE.md
├── NOTES.md
└── README.md
```

---

## 4. Database Schema (Prisma)

### Models

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  role         Role     @default(CUSTOMER)
  createdAt    DateTime @default(now())
  cart         Cart?
  orders       Order[]
}

enum Role {
  CUSTOMER
  ADMIN
}

model Category {
  id       String    @id @default(uuid())
  name     String    @unique
  products Product[]
}

model Product {
  id          String     @id @default(uuid())
  name        String
  description String
  price       Decimal    @db.Decimal(10, 2)
  imageUrl    String?
  stock       Int        @default(0)
  categoryId  String
  category    Category   @relation(fields: [categoryId], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  cartItems   CartItem[]
  orderItems  OrderItem[]
}

model Cart {
  id        String     @id @default(uuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id])
  items     CartItem[]
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String  @id @default(uuid())
  cartId    String
  cart      Cart    @relation(fields: [cartId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int

  @@unique([cartId, productId])
}

model Order {
  id          String      @id @default(uuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  status      OrderStatus @default(PENDING)
  totalAmount Decimal     @db.Decimal(10, 2)
  items       OrderItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model OrderItem {
  id         String  @id @default(uuid())
  orderId    String
  order      Order   @relation(fields: [orderId], references: [id])
  productId  String
  product    Product @relation(fields: [productId], references: [id])
  quantity   Int
  priceAtPurchase Decimal @db.Decimal(10, 2)
}
```

### Key data-integrity rules
- `priceAtPurchase` is snapshotted at checkout — never recalculated from current product price
- `stock` is decremented atomically at order creation; if insufficient stock, throw 422
- `totalAmount` is calculated server-side from `priceAtPurchase × quantity`; never trust client-submitted totals
- Cancelled orders must restock the product quantities (implement in order status update)

---

## 5. API Endpoint Map

### Auth
| Method | Path                  | Guard  | Description               |
|--------|-----------------------|--------|---------------------------|
| POST   | /auth/register        | Public | Create customer account   |
| POST   | /auth/login           | Public | Return JWT tokens         |
| POST   | /auth/refresh         | Public | Refresh access token      |

### Products (public reads, admin writes)
| Method | Path                  | Guard  | Description                                    |
|--------|-----------------------|--------|------------------------------------------------|
| GET    | /products             | Public | List with search, filter, sort, paginate       |
| GET    | /products/:id         | Public | Single product detail                          |
| POST   | /products             | Admin  | Create product                                 |
| PATCH  | /products/:id         | Admin  | Update product                                 |
| DELETE | /products/:id         | Admin  | Delete product                                 |

**Query params for GET /products:**
`?search=`, `?categoryId=`, `?minPrice=`, `?maxPrice=`, `?sortBy=price|createdAt`, `?order=asc|desc`, `?page=`, `?limit=`

### Categories
| Method | Path            | Guard  | Description     |
|--------|-----------------|--------|-----------------|
| GET    | /categories     | Public | List categories |
| POST   | /categories     | Admin  | Create category |

### Cart
| Method | Path                  | Guard    | Description              |
|--------|-----------------------|----------|--------------------------|
| GET    | /cart                 | Customer | Get current user's cart  |
| POST   | /cart/items           | Customer | Add item to cart         |
| PATCH  | /cart/items/:productId | Customer | Update item quantity    |
| DELETE | /cart/items/:productId | Customer | Remove item from cart   |
| DELETE | /cart                 | Customer | Clear entire cart        |

### Orders
| Method | Path              | Guard    | Description                      |
|--------|-------------------|----------|----------------------------------|
| POST   | /orders/checkout  | Customer | Create order from cart, mock pay |
| GET    | /orders           | Customer | Customer's own order history     |
| GET    | /orders/:id       | Customer | Single order detail              |

### Admin — Orders
| Method | Path                      | Guard | Description              |
|--------|---------------------------|-------|--------------------------|
| GET    | /admin/orders             | Admin | All orders (paginated)   |
| PATCH  | /admin/orders/:id/status  | Admin | Update order status      |

### Admin — Dashboard
| Method | Path                      | Guard | Description                              |
|--------|---------------------------|-------|------------------------------------------|
| GET    | /admin/dashboard/stats    | Admin | Total sales, orders by status, top products |

### Suggestions
| Method | Path                  | Guard    | Description                         |
|--------|-----------------------|----------|-------------------------------------|
| GET    | /suggestions          | Customer | Personalized product suggestions    |

---

## 6. Code Style & Validation Rules

### NestJS Conventions
- All modules use `@Module({ controllers, providers, imports, exports })`
- Every route handler has a DTO with `class-validator` decorators
- Enable global `ValidationPipe` in `main.ts`:
  ```ts
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  ```
- Use `@ApiProperty()` (Swagger) on all DTOs if time allows

### DTO Validation Examples
```ts
// CreateProductDto
@IsString() @IsNotEmpty() name: string
@IsString() @IsNotEmpty() description: string
@IsNumber() @IsPositive() price: number
@IsInt() @Min(0) stock: number
@IsUUID() categoryId: string
@IsUrl() @IsOptional() imageUrl?: string

// RegisterDto
@IsEmail() email: string
@IsString() @MinLength(8) password: string
@IsString() @IsNotEmpty() name: string

// CartItemDto
@IsUUID() productId: string
@IsInt() @Min(1) quantity: number

// UpdateOrderStatusDto
@IsEnum(OrderStatus) status: OrderStatus
```

### HTTP Exception Handling
- Use NestJS built-in exceptions: `NotFoundException`, `BadRequestException`, `ForbiddenException`, `UnauthorizedException`, `ConflictException`
- For stock violation: `HttpException('Insufficient stock for product X', HttpStatus.UNPROCESSABLE_ENTITY)`
- Global exception filter: `AllExceptionsFilter` — catches all, returns `{ statusCode, message, timestamp, path }`, never leaks stack traces in production
- Set `NODE_ENV=production` to suppress stack traces

### Guards
- `JwtAuthGuard` — validates access token, attaches `req.user`
- `RolesGuard` — checks `req.user.role` against `@Roles(Role.ADMIN)` decorator
- Apply globally: `JwtAuthGuard` on all, then use `@Public()` decorator to exempt public routes

### Response Shape
All successful responses follow:
```json
{ "data": ..., "meta": { "page": 1, "limit": 20, "total": 100 } }
```
(meta only on paginated endpoints)

---

## 7. Feature Checklists

### Customer Storefront
- [ ] **Product Catalog**
  - [ ] List products: name, description, price, image, category, stock
  - [ ] Search by product name (case-insensitive `ILIKE`)
  - [ ] Filter by categoryId
  - [ ] Filter by minPrice / maxPrice
  - [ ] Sort by price ASC/DESC
  - [ ] Sort by createdAt (newest)
  - [ ] Pagination (page + limit, default limit=12)
- [ ] **Product Detail Page**
  - [ ] Full product info displayed
  - [ ] Quantity selector (respect stock limit)
  - [ ] Add to cart button
- [ ] **Shopping Cart**
  - [ ] Add item (merge if already in cart)
  - [ ] Remove item
  - [ ] Update quantity
  - [ ] Clear cart
  - [ ] Persist for logged-in users (server-side cart)
  - [ ] Line totals and order total displayed
- [ ] **Checkout**
  - [ ] Order summary shown before payment
  - [ ] Stripe test mode OR clearly-mocked payment step
  - [ ] On success: create order, decrement stock, clear cart
  - [ ] Order confirmation page with order ID
  - [ ] Stock validation at checkout (not just at add-to-cart)
- [ ] **Order History**
  - [ ] List past orders (status, date, total)
  - [ ] Order detail view (line items, statuses)
- [ ] **Authentication**
  - [ ] Signup with validation
  - [ ] Login, receive JWT
  - [ ] Protected routes redirect to login
  - [ ] JWT stored in httpOnly cookie or localStorage (document choice)

### Admin Panel
- [ ] **Access Control**
  - [ ] All `/admin/*` routes + API endpoints require `Role.ADMIN`
  - [ ] Regular customers get 403 if they hit admin endpoints
  - [ ] Admin UI at `/admin` path, guarded client-side and server-side
- [ ] **Product Management**
  - [ ] Create product with category, price, stock, image
  - [ ] Edit product (all fields)
  - [ ] Delete product (soft-delete preferred if referenced by orders)
  - [ ] Image: accept URL string (document that upload is stretch goal)
- [ ] **Order Management**
  - [ ] View all orders (paginated), filterable by status
  - [ ] Update order status: PENDING → PROCESSING → SHIPPED → DELIVERED
  - [ ] Cancel order (restock items)
- [ ] **Dashboard Analytics**
  - [ ] Total revenue (sum of delivered + shipped order totals)
  - [ ] Order count by status
  - [ ] Top 5 selling products by units sold
  - [ ] At least ONE chart (bar or pie for order-status distribution)

---

## 8. Security Requirements

- Passwords: `bcrypt` with salt rounds ≥ 10, never stored or logged in plain text
- JWTs: signed with `JWT_SECRET` from env; access token expiry 15m, refresh token 7d
- All secrets in `.env`, never committed; `.env.example` committed with placeholder values
- CORS: restrict to known frontend origin in production
- SQL injection: Prisma parameterised queries prevent this by default — never use raw template strings with user input
- Input sanitisation: `class-validator` + `whitelist: true` strips unknown fields
- Admin guard: `RolesGuard` + `@Roles(Role.ADMIN)` on every admin controller/endpoint
- No stack traces in error responses when `NODE_ENV=production`

---

## 9. Seed Script (`prisma/seed.ts`)

The seed must create and be idempotent (upsert):

### Users
| Email                     | Password     | Role     |
|---------------------------|--------------|----------|
| admin@store.com           | Admin1234!   | ADMIN    |
| customer@store.com        | Customer1234! | CUSTOMER |

### Categories (minimum 4)
- Electronics, Clothing, Books, Home & Garden

### Products (minimum 12, 3 per category)
Each with: name, description, realistic price, stock ≥ 10, imageUrl (use placeholder or public image URL), categoryId

### Run command
```bash
cd backend && npx prisma db seed
```
Configured in `package.json`:
```json
"prisma": { "seed": "ts-node prisma/seed.ts" }
```

---

## 10. Testing

### What to test (quality over quantity)
1. **Auth unit tests** — register returns hashed password, login returns JWT, wrong password returns 401
2. **Cart service unit tests** — add item, update quantity, stock limit check
3. **Order service unit tests** — checkout calculates correct total, decrements stock, throws on insufficient stock
4. **Product list E2E** — GET /products with filter/sort/pagination returns correct shape
5. **Admin guard E2E** — customer JWT on admin endpoint returns 403

### Setup
```bash
# Unit tests
cd backend && npm test

# E2E tests
cd backend && npm run test:e2e
```

Use a separate test database (`DATABASE_URL_TEST`) or in-memory mocks for unit tests.

---

## 11. Architecture Assumptions & Open-Ended Feature

### Product Suggestions — Interpretation & Design

**Chosen interpretation:** Category-based + purchase-history collaborative suggestions.

**What "relevant" means here:**
A product is relevant to a customer if:
1. It belongs to a category the customer has previously ordered from (history-based affinity)
2. It is not a product they have already ordered
3. It has stock available (stock > 0)
4. As a tiebreaker, newer products are preferred (reflects inventory freshness)

**Fallback for new/unregistered users:** Return best-sellers (top products by total units sold across all orders) — this handles the cold-start problem.

**Algorithm (server-side, `SuggestionsService`):**
```
1. Fetch user's order history → extract distinct categoryIds from ordered items
2. If no history → fall back to top-sellers query
3. Query products WHERE categoryId IN [...userCategories]
   AND productId NOT IN [...alreadyOrderedProductIds]
   AND stock > 0
   ORDER BY createdAt DESC
   LIMIT 8
4. Return as GET /suggestions (authenticated) or GET /suggestions/popular (public fallback)
```

**Why not ML/embeddings?** Scope constraint. A collaborative filter or embedding-based recommender would require order volume data and infrastructure that doesn't exist in a 5-hour build. The category-affinity approach is deterministic, testable, and explainable — appropriate for MVP.

**What I'd do with more time:**
- Collect product view events and weight by view frequency
- Implement item-to-item collaborative filtering once sufficient order data exists
- Add "customers also bought" based on co-occurrence in order items

**UI placement:** A horizontal scroll row labelled "Recommended for You" on the storefront home page and product detail page.

---

### Other Assumptions

| Decision Point | Assumption Made |
|----------------|-----------------|
| Image upload | Accept image URL string only (no file upload). Admin enters a URL. Document this in README. |
| Payment | Clearly-mocked: a `POST /orders/checkout` with `{ paymentMethod: "mock" }` always returns success. A `MockPaymentService` logs the intent. |
| JWT storage | Access token in memory (React state/context) + refresh token in httpOnly cookie. Reduces XSS surface. |
| Cart for guests | No guest cart. Cart requires login. Unauthenticated users see "Login to add to cart." |
| Soft delete | Products referenced by orders are soft-deleted (`deletedAt` timestamp) rather than hard-deleted. |
| Price type | Stored as `Decimal(10,2)` in DB; transmitted as string in JSON to avoid float precision issues; displayed with `toFixed(2)`. |
| Stock decrement | Happens inside a Prisma transaction at checkout to prevent race conditions. |
| Cancelled orders restock | When admin sets order to CANCELLED, stock is restored for each line item. |
| Order total | Always computed server-side as `SUM(priceAtPurchase * quantity)`. Client total is display-only. |
| Refresh token rotation | Refresh tokens are single-use and rotated on every refresh call. |

---

## 12. Environment Variables

### Backend `.env.example`
```
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db
JWT_SECRET=replace_with_long_random_secret
JWT_REFRESH_SECRET=replace_with_different_long_random_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
NODE_ENV=development
PORT=3001
STRIPE_SECRET_KEY=sk_test_...        # optional; omit if using mock payment
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local.example`
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 13. Build Order (Agentic Workflow)

Follow this sequence to keep the build coherent:

1. **Scaffold** — init NestJS backend, Next.js frontend, Prisma schema, `.env` files
2. **Database** — write `schema.prisma`, run migration, write and run seed script
3. **Auth** — `AuthModule`: register, login, refresh; `JwtAuthGuard`; `RolesGuard`
4. **Products & Categories** — CRUD with validation; public GET endpoints with filtering
5. **Cart** — `CartModule` with full CRUD; session persistence via DB
6. **Orders & Checkout** — mock payment, stock decrement, order creation
7. **Admin Panel (backend)** — admin product management, order status updates, dashboard stats
8. **Suggestions** — `SuggestionsService` with category-affinity logic
9. **Frontend: Storefront** — catalog, product detail, cart UI, checkout flow
10. **Frontend: Auth** — login/signup pages, protected route wrapper
11. **Frontend: Order history** — account section
12. **Frontend: Admin Panel** — product table, order management, dashboard chart
13. **Tests** — unit and E2E for the 5 priority areas listed in section 10
14. **README + NOTES.md** — write as final step; verify clean-clone works

---

## 14. Common Pitfalls to Avoid

- Never return `passwordHash` in any user response — use a `@Exclude()` transformer or manual omission
- Never calculate `totalAmount` from frontend-submitted values
- Never skip the stock check inside the checkout transaction
- Never use `@IsNumber()` for currency — use `@IsDecimal()` or parse as string then validate
- Do not log secrets or JWT tokens
- Do not expose internal Prisma errors — wrap in NestJS exceptions
- Do not use `any` type in TypeScript service methods
- Do not hardcode the JWT secret or DB password anywhere in source files

---

## 15. Definition of Done

The submission is ready when:
- [ ] `git clone` + follow README = running app with no manual fixes
- [ ] Seed credentials work to log in as both admin and customer
- [ ] Product catalog loads with filters and pagination working
- [ ] Add to cart, checkout, and see order confirmation (mock payment)
- [ ] Admin can update order status and manage products
- [ ] Dashboard shows at least one chart
- [ ] Suggestions endpoint returns results for the seeded customer
- [ ] `npm test` passes with no failures
- [ ] No `.env` with real secrets committed
- [ ] `NOTES.md` covers all six required sections
