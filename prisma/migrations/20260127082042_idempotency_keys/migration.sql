-- CreateTable
CREATE TABLE "ApiIdempotency" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,
    "terminalId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "responseJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiIdempotency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiIdempotency_key_key" ON "ApiIdempotency"("key");

-- CreateIndex
CREATE INDEX "ApiIdempotency_locationId_terminalId_createdAt_idx" ON "ApiIdempotency"("locationId", "terminalId", "createdAt");
