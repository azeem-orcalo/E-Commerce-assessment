-- AlterTable: add variant columns with empty-string defaults so existing rows are valid
ALTER TABLE "cart_items" ADD COLUMN "chosenColor" TEXT NOT NULL DEFAULT '';
ALTER TABLE "cart_items" ADD COLUMN "chosenSize"  TEXT NOT NULL DEFAULT '';

-- Drop old unique constraint (cartId, productId)
DROP INDEX IF EXISTS "cart_items_cartId_productId_key";

-- Create new unique constraint that scopes uniqueness to a specific variant combination
CREATE UNIQUE INDEX "cart_items_cartId_productId_chosenColor_chosenSize_key"
  ON "cart_items"("cartId", "productId", "chosenColor", "chosenSize");
