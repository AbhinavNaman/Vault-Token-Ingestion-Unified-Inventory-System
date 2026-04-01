-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessor" TEXT NOT NULL,
    "policies" TEXT[],
    "ttl" INTEGER,
    "createdTime" TIMESTAMP(3),
    "lastAccess" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
