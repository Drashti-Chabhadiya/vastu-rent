-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_ownerId_fkey";
ALTER TABLE "category_request" DROP CONSTRAINT IF EXISTS "category_request_ownerId_fkey";
ALTER TABLE "coupon" DROP CONSTRAINT IF EXISTS "coupon_ownerId_fkey";
ALTER TABLE "payout" DROP CONSTRAINT IF EXISTS "payout_ownerId_fkey";

-- Rename Columns
ALTER TABLE "Product" RENAME COLUMN "ownerId" TO "userId";
ALTER TABLE "category_request" RENAME COLUMN "ownerId" TO "userId";
ALTER TABLE "coupon" RENAME COLUMN "ownerId" TO "userId";
ALTER TABLE "payout" RENAME COLUMN "ownerId" TO "userId";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "category_request" ADD CONSTRAINT "category_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "coupon" ADD CONSTRAINT "coupon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payout" ADD CONSTRAINT "payout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable (Conditional for cloudinary_config)
CREATE TABLE IF NOT EXISTS "cloudinary_config" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cloudName" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,
    "uploadPreset" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cloudinary_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "cloudinary_config_userId_key" ON "cloudinary_config"("userId");

-- AddForeignKey for cloudinary_config
ALTER TABLE "cloudinary_config" DROP CONSTRAINT IF EXISTS "cloudinary_config_userId_fkey";
ALTER TABLE "cloudinary_config" ADD CONSTRAINT "cloudinary_config_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
