-- CreateTable
CREATE TABLE "Supply" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supply_pkey" PRIMARY KEY ("id")
);
