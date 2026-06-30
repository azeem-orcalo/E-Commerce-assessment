# E-Commerce Platform

A full-stack e-commerce app with a customer storefront and admin panel.

- **Backend** — NestJS + PostgreSQL + Prisma (runs on port 3001)
- **Frontend** — Next.js 14 App Router + Tailwind CSS (runs on port 3000)

---

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a remote connection string)
- npm

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd E-Commerce-test

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 2. Configure Environment Variables

### Backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in your values:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/ecommerce_db
JWT_SECRET=any_long_random_string
JWT_REFRESH_SECRET=another_long_random_string
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
```

`frontend/.env.local` should contain:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 3. Set Up the Database

```bash
cd backend

# Run migrations (creates all tables)
npx prisma migrate dev

# Seed demo data (users, categories, products)
npx prisma db seed
```

### Seeded accounts

| Role     | Email                  | Password      |
|----------|------------------------|---------------|
| Admin    | admin@store.com        | Admin1234!    |
| Customer | customer@store.com     | Customer1234! |

---

## 4. Run the App

Open **two terminals**:

**Terminal 1 — Backend**

```bash
cd backend
npm run start:dev
```

Backend runs at: `http://localhost:3001`

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 5. Quick Links

| Page               | URL                              |
|--------------------|----------------------------------|
| Storefront         | http://localhost:3000            |
| Login              | http://localhost:3000/login      |
| Admin Panel        | http://localhost:3000/admin      |
| API (Swagger)      | http://localhost:3001/api        |

---

## 6. Run Tests

```bash
cd backend

# Unit tests
npm test

# End-to-end tests
npm run test:e2e
```

---

## Notes

- Payment is mocked — no real card is charged. Use any value at checkout.
- Product images are URL strings only (no file upload).
- Cart requires login; guest cart is not supported.
