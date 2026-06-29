# Skill: API Validation

## Purpose
Definitive rules for NestJS global pipe configuration, `class-validator` decorator usage,
DTO patterns, and preventing raw stack trace / Prisma error leakage across all endpoints
of the ThreadCo e-commerce API.

---

## Global ValidationPipe (main.ts)

This config is canonical — do not change it without a documented reason:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // strips unknown properties silently
    forbidNonWhitelisted: true, // throws 400 if unknown property is sent
    transform: true,           // auto-converts strings to declared types (e.g. "1" → number)
    transformOptions: {
      enableImplicitConversion: true,  // allows @Type() free inference for primitives
    },
  }),
);
```

**Why `whitelist: true`:** Prevents mass-assignment attacks — extra fields from the request
body are stripped before the DTO reaches the service layer.

**Why `forbidNonWhitelisted: true`:** Fails fast with 400 Bad Request if the client sends
unexpected fields, surfacing API contract violations immediately rather than silently ignoring them.

**Why `transform: true`:** Enables `@Type(() => Number)` and implicit conversion so query
string params like `?page=2` arrive as `number 2` in the controller without manual `parseInt`.

---

## Query Param DTO Pattern

Query params always arrive as strings. Use `@Type()` for coercion:

```ts
import { IsOptional, IsString, IsUUID, IsInt, Min, IsIn, IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetProductsQueryDto {
  @IsString() @IsOptional()
  search?: string;

  @IsUUID('4') @IsOptional()
  categoryId?: string;

  @Type(() => Number)
  @IsInt() @Min(0) @IsOptional()
  minPrice?: number;

  @Type(() => Number)
  @IsInt() @Min(0) @IsOptional()
  maxPrice?: number;

  @IsIn(['price', 'createdAt']) @IsOptional()
  sortBy?: 'price' | 'createdAt';

  @IsIn(['asc', 'desc']) @IsOptional()
  order?: 'asc' | 'desc';

  @Type(() => Number)
  @IsInt() @Min(1) @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt() @Min(1) @IsOptional()
  limit?: number = 12;
}
```

Apply via `@Query()` with the DTO class:
```ts
async findAll(@Query() query: GetProductsQueryDto) { ... }
```

---

## Body DTO Patterns by Domain

### Auth DTOs

```ts
// RegisterDto
@IsEmail({}, { message: 'Please provide a valid email address' })
email: string;

@IsString()
@MinLength(8, { message: 'Password must be at least 8 characters' })
@MaxLength(64, { message: 'Password must not exceed 64 characters' })
password: string;

@IsString()
@IsNotEmpty({ message: 'Name is required' })
@MaxLength(100)
name: string;
```

```ts
// LoginDto
@IsEmail() email: string;
@IsString() @IsNotEmpty() password: string;
```

### Product DTOs

```ts
// CreateProductDto
@IsString() @IsNotEmpty()                     name: string;
@IsString() @IsNotEmpty()                     description: string;
@IsNumberString()                             price: string;   // "29.99" — Decimal safe
@IsInt() @Min(0) @Type(() => Number)          stock: number;
@IsUUID('4')                                  categoryId: string;
@IsString() @IsOptional() @MaxLength(200)     material?: string;
@IsUrl() @IsOptional()                        imageUrl?: string;
@IsObject() @IsOptional()
@ValidateNested()
@Type(() => ProductVariantsDto)               variants?: ProductVariantsDto;

// UpdateProductDto — all fields optional
export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

### Cart DTOs

```ts
// AddCartItemDto
@IsUUID('4')                              productId: string;
@IsInt() @Min(1) @Type(() => Number)      quantity: number;

// UpdateCartItemDto
@IsInt() @Min(1) @Type(() => Number)      quantity: number;
```

### Order DTOs

```ts
// CheckoutDto
@IsIn(['mock', 'stripe']) @IsOptional()   paymentMethod?: 'mock' | 'stripe';

// UpdateOrderStatusDto (admin)
@IsEnum(OrderStatus)                      status: OrderStatus;
```

---

## Why `@IsNumberString()` for Prices

`@IsNumber()` triggers `parseFloat()` internally, which loses precision on numbers like
`19.999999999...`. Prisma `Decimal(10,2)` stores the value exactly, but the boundary
between client and server must treat price as a string to avoid float imprecision.

```ts
// Correct
@IsNumberString() price: string;   // "29.99" stays "29.99"

// Wrong — float precision issues
@IsNumber() price: number;         // 29.99 may become 29.990000000000001
```

In the service, pass directly to Prisma without parseFloat:
```ts
await prisma.product.create({ data: { price: dto.price } });
// Prisma's Decimal type handles the string-to-Decimal conversion internally
```

---

## UUID Validation

Always use `@IsUUID('4')` for UUID path params and foreign key fields.
Apply `@ParseUUIDPipe()` in controller param decorators to get 400 (not 500) on bad UUIDs:

```ts
@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string) { ... }
```

Without `ParseUUIDPipe`, Prisma throws `PrismaClientKnownRequestError` on a malformed UUID —
which would leak an internal error if not caught.

---

## AllExceptionsFilter (common/filters/all-exceptions.filter.ts)

```ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message ?? message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Map common Prisma errors to HTTP errors without leaking internals
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'A record with this value already exists';
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
      }
      // Log the full error server-side for debugging
      this.logger.error(`Prisma ${exception.code}: ${exception.message}`);
    } else {
      // Unknown error — log but never expose details to client
      this.logger.error('Unhandled exception', exception instanceof Error ? exception.stack : String(exception));
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

Register globally in `main.ts`:
```ts
app.useGlobalFilters(new AllExceptionsFilter());
```

---

## Stack Trace Suppression

NestJS shows full stack traces in development by default. Production must suppress them:

```ts
// main.ts — already handled by AllExceptionsFilter above
// Ensure NODE_ENV=production in deployment environment

// Additional safety — never log user passwords or tokens:
// WRONG:
this.logger.debug(`Login attempt: ${JSON.stringify(loginDto)}`);  // logs password!

// CORRECT:
this.logger.debug(`Login attempt for: ${loginDto.email}`);
```

---

## Validation Error Response Shape

When `ValidationPipe` rejects a request, NestJS returns:

```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be at least 8 characters"],
  "error": "Bad Request"
}
```

The `AllExceptionsFilter` intercepts this and normalises to:

```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be at least 8 characters"],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/register"
}
```

The `message` field is either a `string` or `string[]` — clients must handle both.

---

## Swagger Annotations (when time allows)

All DTOs should have `@ApiProperty()` for Swagger documentation:

```ts
@ApiProperty({ example: 'user@example.com', description: 'User email address' })
@IsEmail()
email: string;

@ApiProperty({ example: '29.99', description: 'Product price as decimal string' })
@IsNumberString()
price: string;

// Optional fields
@ApiPropertyOptional({ example: 'https://example.com/img.jpg' })
@IsUrl() @IsOptional()
imageUrl?: string;
```

Controllers use `@ApiTags('products')`, `@ApiBearerAuth()` for JWT-protected routes.
