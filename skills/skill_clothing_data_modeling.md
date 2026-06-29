# Skill: Clothing Data Modeling

## Purpose
Guidelines for modeling clothing products with category management and
size/color/material attributes stored safely in PostgreSQL JSONB fields
via Prisma's `Json` type.

---

## Category Structure (ThreadCo)

The store uses four top-level clothing categories. These are seeded idempotently:

| Category | Products |
|---|---|
| Casual Wear | T-shirts, chinos, linen shirts |
| Formal Wear | Dress shirts, blazers, dress trousers |
| Activewear | Running tees, leggings, track jackets |
| Accessories | Belts, scarves, tote bags |

**Rules:**
- Categories have no hierarchy (flat structure) — adding sub-categories is a future concern
- A product belongs to exactly one category (`categoryId` FK, required)
- Categories are `@unique` by name — duplicates prevented at DB level
- Admin can create new categories via `POST /api/categories` (Admin guard)
- Categories cannot be deleted if products reference them (Prisma FK constraint)

---

## Product Model — Clothing Fields

```prisma
model Product {
  id          String    @id @default(uuid())
  name        String
  description String
  price       Decimal   @db.Decimal(10, 2)
  imageUrl    String?
  stock       Int       @default(0)
  deletedAt   DateTime?          // soft-delete only — never hard-delete if in orders

  // Clothing-specific
  material    String?            // Human-readable label: "100% Ring-Spun Premium Cotton"
  variants    Json?              // JSONB: { sizes: string[], colors: string[] }

  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("products")
}
```

---

## Variants JSONB Schema

The `variants` field stores a structured JSON object. TypeScript interface:

```ts
interface ProductVariants {
  sizes: string[];   // e.g. ["XS","S","M","L","XL","XXL"] or ["28","30","32"]
  colors: string[];  // e.g. ["White","Black","Navy Blue","Heather Grey"]
}
```

**Prisma read:**
```ts
// Prisma returns variants as `JsonValue` — cast with type guard
function parseVariants(raw: Prisma.JsonValue | null): ProductVariants | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  return {
    sizes:  Array.isArray(obj['sizes'])  ? (obj['sizes']  as string[]) : [],
    colors: Array.isArray(obj['colors']) ? (obj['colors'] as string[]) : [],
  };
}
```

**Prisma write (seed / service):**
```ts
// Cast to Prisma.InputJsonValue for upsert/create/update
const variantsJson = variants as unknown as Prisma.InputJsonValue;
await prisma.product.create({ data: { ..., variants: variantsJson } });
```

**Never use raw SQL template strings** to insert variant data — always go through Prisma's
parameterised query layer to prevent SQL injection.

---

## Size Options by Category

| Category | Size Format | Example Values |
|---|---|---|
| Casual Wear (tops) | Alpha | XS, S, M, L, XL, XXL |
| Formal Wear (tops) | Alpha | S, M, L, XL, XXL |
| Formal Wear (blazers) | Chest (Reg) | 36R, 38R, 40R, 42R, 44R, 46R |
| Bottoms (all) | Waist (inches) | 28, 30, 32, 34, 36, 38 |
| Activewear | Alpha | XS, S, M, L, XL (no XXL for leggings) |
| Accessories (fixed) | One Size | One Size |

Store all sizes as strings — numeric waist sizes ("28") and alpha sizes ("M") are both strings.
Never store sizes as integers — "28" is a waist, not a quantity.

---

## Color Naming Convention

Colors are stored as descriptive names, not hex codes, for human readability in admin UI.
Frontend renders swatches via a `colorMap` lookup:

```ts
const colorMap: Record<string, string> = {
  'White':         '#FFFFFF',
  'Black':         '#111111',
  'Navy Blue':     '#1E3A5F',
  'Heather Grey':  '#9CA3AF',
  'Forest Green':  '#166534',
  'Khaki':         '#C3A882',
  'Olive':         '#707B4F',
  'Charcoal':      '#374151',
  'Crisp White':   '#F9FAFB',
  'Light Blue':    '#BAE6FD',
  'Electric Blue': '#3B82F6',
  'Signal Orange': '#F97316',
  'Dusty Rose':    '#F9A8D4',
  'Burgundy':      '#7F1D1D',
  'Camel':         '#C2956C',
  'Cognac':        '#9A4722',
  'Ivory':         '#FFFFF0',
  // Extend as new products are added
};
```

If a color has no entry in `colorMap`, fall back to `backgroundColor: color` (CSS named color or the string itself as-is).

---

## Material Field Guidelines

`material` is a free-text label, not an enum. Conventions:

- Lead with percentage composition: `"100% Cotton"`, `"60% Wool, 40% Recycled Polyester"`
- Include special descriptors when meaningful: `"100% Ring-Spun Premium Cotton"`, `"100% Fine Merino Wool (18.5 micron)"`
- Max display length in UI: truncate to 60 characters with `…` if needed
- Displayed as a badge/chip on product detail page

---

## Soft-Delete Pattern

Products referenced by `OrderItem` must never be hard-deleted — it would break order history.

```ts
// Soft-delete (admin DELETE /products/:id)
await prisma.product.update({
  where: { id },
  data: { deletedAt: new Date() },
});

// All product queries MUST include this filter to hide deleted items
const products = await prisma.product.findMany({
  where: { deletedAt: null, ...otherFilters },
});
```

Only show soft-deleted products in admin "archived" views if that feature is ever added.
The storefront and cart must never show deleted products.

---

## DTO for Product Creation/Update

```ts
export class CreateProductDto {
  @IsString() @IsNotEmpty()                  name: string;
  @IsString() @IsNotEmpty()                  description: string;
  @IsNumberString()                          price: string;      // "29.99" — Decimal safe
  @IsInt() @Min(0)                           stock: number;
  @IsUUID('4')                               categoryId: string;
  @IsString() @IsOptional()                  material?: string;
  @IsUrl() @IsOptional()                     imageUrl?: string;
  @IsObject() @IsOptional()
  @ValidateNested()
  @Type(() => ProductVariantsDto)            variants?: ProductVariantsDto;
}

export class ProductVariantsDto {
  @IsArray() @IsString({ each: true })       sizes: string[];
  @IsArray() @IsString({ each: true })       colors: string[];
}
```

`@IsNumberString()` is correct for Decimal fields — it validates the string is a valid number
without floating-point precision loss that `@IsNumber()` introduces.

---

## Stock Integrity Rules

1. `stock` can never go below 0 — enforced in checkout transaction and cart add
2. On order cancellation, stock MUST be restored: `{ stock: { increment: qty } }` per line item
3. On `UPDATE` to increase stock (admin restock), no upper bound is enforced at DB level
4. `stock` of a soft-deleted product is irrelevant — never show in UI
5. A cart item referencing a product with `stock=0` at checkout time → 422 (not silently skipped)
