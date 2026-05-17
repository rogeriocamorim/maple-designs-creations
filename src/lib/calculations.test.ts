import { describe, it, expect } from "vitest";
import {
  calcFilamentLineCost,
  calcPrinterHourlyCost,
  calcPrinterCost,
  calcLaborCost,
  calcCOGS,
  calcEtsyFees,
  calcGenericFees,
  calcNetProfit,
  calcGrossMarginPct,
  calcNetMarginPct,
  calcProfitPerHour,
  calcSuggestedPrice,
  calcMarketplaceResult,
} from "./calculations";
import type { MarketplaceData } from "./types";

const etsyMarketplace: MarketplaceData = {
  id: 1,
  name: "Etsy",
  type: "etsy",
  listingFee: 0.2,
  transactionFeePct: 6.5,
  paymentProcessingPct: 3.0,
  paymentProcessingFixed: 0.25,
  referralFeePct: null,
  adSpendEntries: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const amazonMarketplace: MarketplaceData = {
  id: 2,
  name: "Amazon",
  type: "amazon",
  listingFee: null,
  transactionFeePct: null,
  paymentProcessingPct: null,
  paymentProcessingFixed: null,
  referralFeePct: 15,
  adSpendEntries: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("calcFilamentLineCost", () => {
  it("calculates correctly with no waste", () => {
    expect(calcFilamentLineCost(100, 1000, 25, 0)).toBeCloseTo(2.5);
  });

  it("calculates correctly with 5% waste", () => {
    expect(calcFilamentLineCost(100, 1000, 25, 5)).toBeCloseTo(2.625);
  });

  it("returns 0 for 0 grams", () => {
    expect(calcFilamentLineCost(0, 1000, 25, 5)).toBe(0);
  });

  it("returns 0 for 0 spool size", () => {
    expect(calcFilamentLineCost(100, 0, 25, 5)).toBe(0);
  });

  it("handles full spool", () => {
    expect(calcFilamentLineCost(1000, 1000, 25, 0)).toBeCloseTo(25);
  });
});

describe("calcPrinterHourlyCost", () => {
  it("calculates electricity, maintenance, depreciation", () => {
    const result = calcPrinterHourlyCost(
      { powerWatts: 200, maintenanceCostPerHr: 0.1, purchasePrice: 500, lifespanHours: 2000 },
      0.12
    );
    expect(result.electricity).toBeCloseTo(0.024);
    expect(result.maintenance).toBeCloseTo(0.1);
    expect(result.depreciation).toBeCloseTo(0.25);
    expect(result.total).toBeCloseTo(0.374);
  });

  it("returns 0 depreciation when lifespan is 0", () => {
    const result = calcPrinterHourlyCost(
      { powerWatts: 250, maintenanceCostPerHr: 0.06, purchasePrice: 629, lifespanHours: 0 },
      0.12
    );
    expect(result.depreciation).toBe(0);
  });
});

describe("calcPrinterCost", () => {
  it("multiplies hourly cost by print time", () => {
    const cost = calcPrinterCost(
      { powerWatts: 200, maintenanceCostPerHr: 0.1, purchasePrice: 500, lifespanHours: 2000 },
      0.12,
      2
    );
    expect(cost).toBeCloseTo(0.748);
  });
});

describe("calcLaborCost", () => {
  it("converts minutes to hours and multiplies", () => {
    expect(calcLaborCost(30, 15)).toBeCloseTo(7.5);
    expect(calcLaborCost(60, 15)).toBeCloseTo(15);
    expect(calcLaborCost(0, 15)).toBe(0);
  });
});

describe("calcCOGS", () => {
  it("sums all cost components", () => {
    const result = calcCOGS(3.84, 0.2, 0, 0);
    expect(result.total).toBeCloseTo(4.04);
    expect(result.filamentCost).toBe(3.84);
  });
});

describe("calcEtsyFees", () => {
  it("calculates Etsy fees for $20 sale", () => {
    const fees = calcEtsyFees(20, 0.2, 6.5, 3.0, 0.25);
    // listing: 0.20, transaction: 1.30, procPct: 0.60, procFixed: 0.25
    expect(fees).toBeCloseTo(2.35);
  });

  it("calculates Etsy fees for $9.88 sale", () => {
    const fees = calcEtsyFees(9.88, 0.2, 6.5, 3.0, 0.25);
    expect(fees).toBeGreaterThan(1);
    expect(fees).toBeLessThan(3);
  });
});

describe("calcGenericFees", () => {
  it("applies referral percentage", () => {
    expect(calcGenericFees(100, 15)).toBeCloseTo(15);
    expect(calcGenericFees(20, 15)).toBeCloseTo(3);
  });
});

describe("calcNetProfit", () => {
  it("calculates net profit without discount", () => {
    expect(calcNetProfit(20, 0, 5, 2)).toBeCloseTo(13);
  });

  it("applies discount before subtracting costs", () => {
    // price = 20, discount = 10%, effective = 18, profit = 18 - 5 - 2 = 11
    expect(calcNetProfit(20, 10, 5, 2)).toBeCloseTo(11);
  });

  it("handles 100% discount", () => {
    expect(calcNetProfit(20, 100, 5, 2)).toBeCloseTo(-7);
  });
});

describe("calcGrossMarginPct", () => {
  it("calculates gross margin", () => {
    expect(calcGrossMarginPct(20, 4)).toBeCloseTo(80);
    expect(calcGrossMarginPct(10, 5)).toBeCloseTo(50);
  });

  it("returns 0 for zero price", () => {
    expect(calcGrossMarginPct(0, 5)).toBe(0);
  });
});

describe("calcNetMarginPct", () => {
  it("calculates net margin", () => {
    expect(calcNetMarginPct(9, 20)).toBeCloseTo(45);
  });
});

describe("calcProfitPerHour", () => {
  it("divides profit by hours", () => {
    expect(calcProfitPerHour(4.45, 2)).toBeCloseTo(2.225);
  });

  it("returns 0 for zero hours", () => {
    expect(calcProfitPerHour(10, 0)).toBe(0);
  });
});

describe("calcSuggestedPrice", () => {
  it("returns a price that achieves target net margin on Etsy", () => {
    const cogs = 5;
    const targetMargin = 45;
    const price = calcSuggestedPrice(cogs, etsyMarketplace, targetMargin);
    // Verify the round-trip: compute net margin with the suggested price
    const fees = calcEtsyFees(price, 0.2, 6.5, 3.0, 0.25);
    const netProfit = calcNetProfit(price, 0, cogs, fees);
    const netMargin = calcNetMarginPct(netProfit, price);
    expect(netMargin).toBeCloseTo(targetMargin, 0);
  });

  it("returns a price that achieves target net margin on Amazon", () => {
    const cogs = 5;
    const targetMargin = 45;
    const price = calcSuggestedPrice(cogs, amazonMarketplace, targetMargin);
    const fees = calcGenericFees(price, 15);
    const netProfit = calcNetProfit(price, 0, cogs, fees);
    const netMargin = calcNetMarginPct(netProfit, price);
    expect(netMargin).toBeCloseTo(targetMargin, 0);
  });

  it("handles zero COGS", () => {
    const price = calcSuggestedPrice(0, etsyMarketplace, 45);
    expect(price).toBeGreaterThanOrEqual(0);
  });
});

describe("calcMarketplaceResult", () => {
  const cogs = calcCOGS(3.84, 0.2, 0, 0);

  it("returns full result object for Etsy", () => {
    const result = calcMarketplaceResult(9.88, 0, cogs, etsyMarketplace, 2);
    expect(result.marketplaceId).toBe(1);
    expect(result.listingPrice).toBe(9.88);
    expect(result.buyerPays).toBe(9.88);
    expect(result.netProfit).toBeGreaterThan(0);
    expect(result.profitPerHour).toBeGreaterThan(0);
    expect(result.grossMarginPct).toBeGreaterThan(0);
    expect(result.netMarginPct).toBeGreaterThan(0);
  });

  it("applies discount to buyer pays", () => {
    const result = calcMarketplaceResult(10, 10, cogs, etsyMarketplace, 2);
    expect(result.buyerPays).toBeCloseTo(9);
  });
});
