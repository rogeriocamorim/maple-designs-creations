-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "electricityRatePerKwh" DOUBLE PRECISION NOT NULL DEFAULT 0.12,
    "targetNetMarginPct" DOUBLE PRECISION NOT NULL DEFAULT 45,
    "currency" TEXT NOT NULL DEFAULT 'USD',

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Printer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "nozzleSize" DOUBLE PRECISION,
    "nozzleMaterial" TEXT,
    "buildPlate" TEXT,
    "powerWatts" DOUBLE PRECISION NOT NULL DEFAULT 250,
    "maintenanceCostPerHr" DOUBLE PRECISION NOT NULL DEFAULT 0.06,
    "purchasePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lifespanHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dailyUsageHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Printer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filament" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "colorName" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL DEFAULT '#000000',
    "diameter" DOUBLE PRECISION NOT NULL DEFAULT 1.75,
    "spoolSizeG" DOUBLE PRECISION NOT NULL DEFAULT 1000,
    "costPerSpool" DOUBLE PRECISION NOT NULL,
    "wasteFactor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "purchaseUrl" TEXT,
    "lowStockAlertG" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "currentStockG" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Filament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supply" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marketplace" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "listingFee" DOUBLE PRECISION DEFAULT 0.20,
    "transactionFeePct" DOUBLE PRECISION DEFAULT 6.5,
    "paymentProcessingPct" DOUBLE PRECISION DEFAULT 3.0,
    "paymentProcessingFixed" DOUBLE PRECISION DEFAULT 0.25,
    "referralFeePct" DOUBLE PRECISION DEFAULT 15.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Marketplace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdSpendEntry" (
    "id" TEXT NOT NULL,
    "marketplaceId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalSpend" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdSpendEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" SERIAL NOT NULL,
    "modelName" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filamentCost" DOUBLE PRECISION NOT NULL,
    "printerCost" DOUBLE PRECISION NOT NULL,
    "laborCost" DOUBLE PRECISION NOT NULL,
    "suppliesCost" DOUBLE PRECISION NOT NULL,
    "totalCogs" DOUBLE PRECISION NOT NULL,
    "stateSnapshot" JSONB NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteMarketplaceResult" (
    "id" SERIAL NOT NULL,
    "quoteId" INTEGER NOT NULL,
    "marketplaceId" INTEGER NOT NULL,
    "marketplaceName" TEXT NOT NULL,
    "listingPrice" DOUBLE PRECISION NOT NULL,
    "discountPct" DOUBLE PRECISION NOT NULL,
    "buyerPays" DOUBLE PRECISION NOT NULL,
    "platformFees" DOUBLE PRECISION NOT NULL,
    "netProfit" DOUBLE PRECISION NOT NULL,
    "profitPerHour" DOUBLE PRECISION NOT NULL,
    "grossMarginPct" DOUBLE PRECISION NOT NULL,
    "netMarginPct" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "QuoteMarketplaceResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdSpendEntry" ADD CONSTRAINT "AdSpendEntry_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "Marketplace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteMarketplaceResult" ADD CONSTRAINT "QuoteMarketplaceResult_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteMarketplaceResult" ADD CONSTRAINT "QuoteMarketplaceResult_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "Marketplace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
