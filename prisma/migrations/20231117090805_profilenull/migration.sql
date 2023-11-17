-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "identity_type" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "identity_number" DROP NOT NULL;
