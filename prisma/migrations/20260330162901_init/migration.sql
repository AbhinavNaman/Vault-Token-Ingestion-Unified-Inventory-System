-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Secret" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "version" INTEGER,
    "ttl" INTEGER,
    "createdTime" TIMESTAMP(3),
    "lastAccessed" TIMESTAMP(3),
    "owner" TEXT,
    "status" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Secret_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Secret_providerId_path_key" ON "Secret"("providerId", "path");

-- AddForeignKey
ALTER TABLE "Secret" ADD CONSTRAINT "Secret_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
