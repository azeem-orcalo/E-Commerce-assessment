# E-Commerce Backend (NestJS)

REST API for the mini e-commerce platform. Built with NestJS, Prisma, PostgreSQL, and JWT auth.

---

## Prerequisites

- Node.js 18+
- Docker (for PostgreSQL and RabbitMQ)
- npm

---

## 1. Start Infrastructure (Docker)

Run PostgreSQL and RabbitMQ locally with one command:

```bash
docker run -d --name postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ecommerce_db -p 5432:5432 postgres:16-alpine; docker run -d --name rabbitmq -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=password -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

| Service    | URL                          | Credentials         |
|------------|------------------------------|---------------------|
| PostgreSQL | `localhost:5432`             | postgres / password |
| RabbitMQ   | `http://localhost:15672`     | admin / password    |

---

## 2. Environment Setup

Copy the example env file and fill in values:

```bash
cp .env.example .env
```

The default `.env` for local development:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecommerce_db
JWT_SECRET=dev_jwt_secret_change_before_prod_abcdef1234567890abcdef1234567890
JWT_REFRESH_SECRET=dev_refresh_secret_change_before_prod_abcdef1234567890abcdef12345
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
RABBITMQ_URL=amqp://admin:password@localhost:5672
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Database Migration

```bash
npx prisma migrate dev --name init
```

---

## 5. Seed the Database

```bash
npx prisma db seed
```

This creates all required seed data (idempotent — safe to run multiple times).

### Seed Accounts

| Role     | Email                   | Password       |
|----------|-------------------------|----------------|
| Admin    | admin@store.com         | Admin1234!     |
| Customer | customer@store.com      | Customer1234!  |

### Seed Categories

- Electronics
- Clothing
- Books
- Home & Garden

### Seed Products

12 products seeded (3 per category) with realistic names, prices, stock ≥ 10, and placeholder image URLs.

---

## 6. Run the Server

```bash
# development (watch mode)
npm run start:dev

# standard
npm run start

# production
npm run start:prod
```

API runs at: `http://localhost:3001`

Swagger docs (if enabled): `http://localhost:3001/api`

---

## 7. Run Tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

---

## 8. Key API Endpoints

| Method | Path                        | Auth     | Description                  |
|--------|-----------------------------|----------|------------------------------|
| POST   | /auth/register              | Public   | Create customer account      |
| POST   | /auth/login                 | Public   | Returns JWT tokens           |
| POST   | /auth/refresh               | Public   | Refresh access token         |
| GET    | /products                   | Public   | List with search/filter/sort |
| GET    | /products/:id               | Public   | Product detail               |
| GET    | /cart                       | Customer | Get current cart             |
| POST   | /cart/items                 | Customer | Add item to cart             |
| POST   | /orders/checkout            | Customer | Checkout (mock payment)      |
| GET    | /orders                     | Customer | Order history                |
| GET    | /suggestions                | Customer | Personalised suggestions     |
| GET    | /admin/dashboard/stats      | Admin    | Revenue and top products     |
| GET    | /admin/orders               | Admin    | All orders (paginated)       |
| PATCH  | /admin/orders/:id/status    | Admin    | Update order status          |
| POST   | /products                   | Admin    | Create product               |
| PATCH  | /products/:id               | Admin    | Update product               |
| DELETE | /products/:id               | Admin    | Delete product               |

---

## 9. Project Structure

```
src/
├── auth/           # JWT auth, guards, refresh tokens
├── users/          # User entity
├── products/       # Product CRUD + filtering
├── categories/     # Category management
├── cart/           # Cart operations
├── orders/         # Checkout + order history
├── admin/          # Admin orders + dashboard stats
├── suggestions/    # Category-affinity product suggestions
├── common/         # Guards, filters, interceptors, decorators
├── prisma/         # PrismaService
└── main.ts
```
