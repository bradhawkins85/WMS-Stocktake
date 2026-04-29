-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Stocktake" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "datapelWarehouseId" TEXT,
    "datapelStocktakeId" TEXT
);

-- CreateTable
CREATE TABLE "StocktakeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stocktakeId" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "expectedQty" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'EA',
    "countedQty" REAL,
    "countedById" TEXT,
    "countedAt" DATETIME,
    "notes" TEXT,
    CONSTRAINT "StocktakeItem_stocktakeId_fkey" FOREIGN KEY ("stocktakeId") REFERENCES "Stocktake" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StocktakeItem_countedById_fkey" FOREIGN KEY ("countedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'EA',
    "qrCode" TEXT,
    "datapelProductId" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");
