/*
  Warnings:

  - Added the required column `mountPath` to the `Provider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `Provider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vaultAddr` to the `Provider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "mountPath" TEXT NOT NULL,
ADD COLUMN     "token" TEXT NOT NULL,
ADD COLUMN     "vaultAddr" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Secret" ADD COLUMN     "riskScore" INTEGER;
