# NOTES.md — OmniShop Build Log

Submission notes for the mini e-commerce assessment. Covers agent workflow, supervision, design decisions, assumptions, and trade-offs.

---

## 1. Agentic Workflow

The build was driven by Claude Code (claude-sonnet-4-6) acting as an AI pair-programmer inside VS Code. The agent operated in an interactive loop: I described what to build, the agent proposed an implementation plan, I reviewed it, then the agent wrote and validated the code. I remained in the loop at every step — no autonomous commit-and-push was permitted.

**Rough sequence the agent followed (matching CLAUDE.md §13):**

1. **Scaffold** — NestJS backend with `nest new`, Next.js 14 frontend with `create-next-app`, `.env` files, Prisma config
2. **Database** — Prisma schema, migrations (`prisma migrate dev`), idempotent seed script
3. **Auth** — `AuthModule`: register, login, refresh; `JwtAuthGuard`; `RolesGuard`; `@Public()` / `@Roles()` decorators; bcrypt hashing; unit tests
4. **Products & Categories** — full CRUD with DTO validation; public GET with search/filter/sort/pagination
5. **Cart** — server-side cart with add / update / remove / clear; variant-aware uniqueness (color + size)
6. **Orders & Checkout** — Stripe integration (live test mode) with COD fallback; stock decrement inside a Prisma transaction; offer discount applied at checkout
7. **Admin backend** — product management, order status updates, customer list, dashboard stats
8. **Favourites, Reviews, Offers** — extended features added beyond core spec
9. **Frontend** — Next.js App Router pages: storefront, product detail, cart drawer, checkout, orders, favourites, offers, admin panel
10. **Tests** — auth unit tests (18 cases), backend ran clean
11. **Docs** — CLAUDE.md kept as living spec; NOTES.md (this file) written last

---

## 2. Where the Agent Helped — and Where It Didn't

### Helped significantly
- **Boilerplate elimination.** Generating NestJS modules, controllers, services, DTOs, and Prisma relations from a schema description was fast and mostly correct on the first pass.
- **DTO validation patterns.** `class-validator` decorators, `@Exclude()` on `passwordHash`, global `ValidationPipe` config — the agent got these right without prompting.
- **Security defaults.** The agent proactively added `whitelist: true`, `forbidNonWhitelisted: true`, CORS restriction to `FRONTEND_URL`, cookie-parser for httpOnly refresh tokens, and the `AllExceptionsFilter` stack-trace suppression in production mode.
- **Test structure.** The 18-case auth unit test file — bcrypt verification, token shape checks, user-enumeration-safe error messages — was generated correctly in one pass.
- **Prisma transaction for checkout.** The agent correctly wrapped stock decrements and order creation in a single `prisma.$transaction([...])` without being asked.

### Didn't help / required human correction
- **Prisma 7 adapter pattern.** The agent initially used the classic `prisma.service.ts` pattern (`extends PrismaClient`). Prisma 7 requires the `@prisma/adapter-pg` driver adapter and a separate `prisma.config.ts` — the agent didn't know this and had to be corrected with the updated pattern.
- **Next.js App Router server/client boundary.** The agent occasionally placed `useContext` / `useState` hooks inside Server Components. These were caught during review and fixed by adding `"use client"` directives or splitting the component.
- **Cart uniqueness constraint.** The first CartItem design used `@@unique([cartId, productId])`. Adding clothing variants (color + size) required changing this to `@@unique([cartId, productId, chosenColor, chosenSize])` — the agent needed prompting to see the change was required.
- **Stripe Checkout vs PaymentIntents.** The initial Stripe integration used Checkout Sessions (redirect-based). I redirected the agent to use PaymentIntents with Stripe Elements instead so the checkout stays on-site.

---

## 3. Supervision

Every agent-generated change was reviewed before being committed. The workflow was:

1. Agent proposes and writes code to files
2. I read the diff in VS Code — not just that the file changed, but what changed
3. For anything touching auth, payments, or guards, I manually traced the execution path
4. Only after review did I run `git add` and commit

**Specific supervision moments:**

- Verified that `passwordHash` is never returned in any user-facing response — confirmed via `AuthService` `register()` and `login()` which both destructure the user object and omit `passwordHash`.
- Checked that the `RolesGuard` is applied globally and cannot be bypassed by a CUSTOMER accessing `/api/admin/*` routes.
- Confirmed the checkout transaction (`prisma.$transaction`) contains both the stock decrement loop and the cart clear — so partial failures roll back.
- Reviewed the Stripe PaymentIntent flow: the secret key never reaches the frontend; only `client_secret` is forwarded to Stripe Elements on the browser.
- Verified seed is idempotent (`upsert` not `create`) so re-running it doesn't duplicate data.

---

## 4. Design Workflow

Design decisions were made collaboratively:

**Schema design** — Started from the spec schema in CLAUDE.md §4 and extended it based on product requirements:
- Added `firstName` / `lastName` / `phone` / `city` / `address` to `User` (more realistic profile)
- Added `material` and `variants` (JSONB) to `Product` for clothing attributes
- Added `chosenColor` / `chosenSize` to `CartItem` to capture the variant selection
- Added `Favorite`, `Review`, `Offer` models as extended features
- Added `originalAmount`, `discountPercent`, `discountAmount`, `paymentMethod`, `stripePaymentIntentId` to `Order` for payment and discount tracking

**Frontend architecture** — Next.js 14 App Router with:
- A global `AuthContext` (React context + localStorage for access token; httpOnly cookie for refresh token)
- A `CartDrawer` slide-in panel rather than a dedicated `/cart` page — faster UX for quick edits
- The admin panel at `/admin` with its own `layout.tsx` that enforces `role === ADMIN` client-side (server enforcement is done by the API guards)

**Payment** — Stripe live test mode (`sk_test_...`). A `MockPaymentService` fallback is available when `STRIPE_SECRET_KEY` is absent: it logs the intent and returns `{ paid: true }` deterministically. COD (cash on delivery) is also exposed as a checkout option.

**Styling** — Tailwind CSS utility classes. No component library. Custom `Button` and `Input` primitives in `components/ui/` for consistency.

---

## 5. Assumptions Made

| Area | Assumption |
|---|---|
| Image upload | Admin enters an image URL string. No file upload. Documented in README. |
| Payment | Stripe test mode is the default. If `STRIPE_SECRET_KEY` is absent, a `MockPaymentService` returns success. COD is a second option that skips Stripe entirely. |
| JWT storage | Access token stored in React state / localStorage; refresh token in an httpOnly cookie to reduce XSS surface. `credentials: 'include'` is set on all API calls. |
| Guest cart | No guest cart. Cart requires authentication. Unauthenticated visitors see "Login to add to cart." |
| Soft delete | Products referenced by existing orders are soft-deleted (`deletedAt` timestamp). Hard delete is blocked if order items exist. |
| Currency | Stored as `Decimal(10,2)` in PostgreSQL; transmitted as a string in JSON (`"19.99"`) to avoid IEEE 754 float drift; displayed with `toFixed(2)`. |
| Stock decrement | Inside a Prisma transaction at checkout — not at add-to-cart — to prevent race conditions and double-spend. |
| Cancelled orders | Restocking is the admin's responsibility: when an admin sets order status to `CANCELLED`, the service restores `product.stock` for each line item. |
| Order total | Always computed server-side as `SUM(priceAtPurchase × quantity)`. The client total is display-only and is never trusted. |
| Refresh token rotation | Single-use: each call to `POST /auth/refresh` issues a new pair and invalidates the old refresh token. |
| Suggestions | Category-affinity algorithm (CLAUDE.md §11): products from categories the customer has previously ordered, excluding already-purchased items, ordered by `createdAt DESC`, limit 8. Cold-start fallback returns top-sellers. |
| Extended features | Favourites, product reviews (gated to verified purchasers), and a time-limited Offers system were added beyond the core spec and are fully integrated in both backend and frontend. |

---

## 6. Trade-offs

**Working over polished (per assessment brief)**
- The admin product form reuses a single modal for create and edit. A dedicated page-per-action would be cleaner UX but took more time than the time budget allowed.
- Chart on the dashboard (Recharts `BarChart`) covers order-status distribution and top-5 products by revenue. A more complete analytics view would add time-series revenue, but the single chart satisfies the spec requirement.

**No guest cart**
Implementing a guest cart (localStorage + merge on login) would have added complexity to the cart merge logic and the backend `POST /cart/merge` endpoint. Given the scope, login-first is a reasonable constraint and is clearly communicated in the UI.

**Stripe test mode, not production**
The app uses `sk_test_...` keys from the Stripe Dashboard. No webhook listener is implemented — payment confirmation relies on the PaymentIntent `status === 'succeeded'` check immediately after `confirmCardPayment`. A production build would add a Stripe webhook to handle async confirmation and edge cases (card network delays, 3DS challenges).

**Auth storage**
Access token in localStorage is the pragmatic choice for a Next.js SPA. The security trade-off vs httpOnly cookies is known: localStorage is accessible to XSS, whereas an httpOnly cookie for the access token would not be. The refresh token is in an httpOnly cookie. With more time the access token would move to an httpOnly cookie as well, using a server-side Next.js route handler to proxy API calls.

**No E2E browser tests**
The assessment spec prioritises unit and integration tests. Playwright or Cypress E2E tests were deferred. The 18-case auth unit test suite and the Supertest E2E test for the products endpoint were implemented as specified.

**Prisma 7 adapter pattern**
Using the `@prisma/adapter-pg` driver adapter (Prisma 7 requirement) adds a thin layer of complexity vs the classic `extends PrismaClient` pattern. The benefit is that it matches current Prisma best-practice and removes the deprecation warning. The migration path is documented in `backend/src/prisma/prisma.service.ts`.

**Variants stored as JSONB**
Product variants (`{ sizes: string[], colors: string[] }`) are stored as a JSONB column rather than a separate `Variant` table with foreign keys. This keeps the schema simple at the cost of database-level filtering on variant values. For the MVP scale this is acceptable; a production catalogue would normalise variants.
