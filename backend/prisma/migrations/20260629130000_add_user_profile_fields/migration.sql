-- Add new profile columns as nullable first so existing rows are not blocked
ALTER TABLE "users" ADD COLUMN "firstName" TEXT;
ALTER TABLE "users" ADD COLUMN "lastName"  TEXT;
ALTER TABLE "users" ADD COLUMN "phone"     TEXT;
ALTER TABLE "users" ADD COLUMN "city"      TEXT;
ALTER TABLE "users" ADD COLUMN "address"   TEXT;

-- Back-fill existing rows with placeholder values so NOT NULL can be set
-- (seed script will replace these with real data on next run)
UPDATE "users" SET
  "firstName" = split_part("email", '@', 1),
  "lastName"  = 'User',
  "phone"     = '+15555555555',
  "city"      = 'Unknown',
  "address"   = 'Unknown'
WHERE "firstName" IS NULL;

-- Apply NOT NULL constraints now that every row has a value
ALTER TABLE "users" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "lastName"  SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "phone"     SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "city"      SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "address"   SET NOT NULL;

-- Drop the old single-field name column
ALTER TABLE "users" DROP COLUMN "name";
