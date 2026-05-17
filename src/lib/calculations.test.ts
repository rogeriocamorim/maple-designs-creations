import { describe, it, expect } from "vitest";
import {
  calcFilamentLineCost,
  calcPrinterHourlyCost,
  calcPrinterCost,
  calcLaborCost,
  calcCOGS,
  calcEtsyFees,
  calcGenericFees,
  calcMarketplaceFees,
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

const noFeeMarketplace: MarketplaceData = {
  id: 3,
  name: "Direct",
  type: "other",
  listingFee: null,
  transactionFeePct: null,
  paymentProcessingPct: null,
  paymentProcessingFixed: null,
  referralFeePct: null,
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

  it("returns 0 for negative grams", () => {
    expect(calcFilamentLineCost(-10, 1000, 25, 5)).toBe(0);
  });

  it("returns 0 for 0 spool size", () => {
    expect(calcFilamentLineCost(100, 0, 25, 5)).toBe(0);
  });

  it("returns 0 for negative spool size", () => {
    expect(calcFilamentLineCost(100, -1000, 25, 5)).toBe(0);
  });

  it("handles full spool", () => {
    expect(calcFilamentLineCost(1000, 1000, 25, 0)).toBeCloseTo(25);
  });

  it("handles very small amounts", () => {
    expect(calcFilamentLineCost(1, 1000, 25, 0)).toBeCloseTo(0.025);
  });

  it("handles high waste factor", () => {
    // 100% waste doubles the cost
    expect(calcFilamentLineCost(100, 1000, 25, 100)).toBeCloseTo(5.0);
  });

  it("handles expensive filament", () => {
    // Specialty filament at $80/spool
    expect(calcFilamentLineCost(50, 500, 80, 10)).toBeCloseTo(8.8);
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

  it("handles zero watts (printer off)", () => {
    const result = calcPrinterHourlyCost(
      { powerWatts: 0, maintenanceCostPerHr: 0, purchasePrice: 0, lifespanHours: 0 },
      0.12
    );
    expect(result.electricity).toBe(0);
    expect(result.total).toBe(0);
  });

  it("handles high wattage printer", () => {
    const result = calcPrinterHourlyCost(
      { powerWatts: 1250, maintenanceCostPerHr: 0.1, purchasePrice: 2000, lifespanHours: 5000 },
      0.15
    );
    expect(result.electricity).toBeCloseTo(0.1875);
    expect(result.depreciation).toBeCloseTo(0.4);
    expect(result.total).toBeCloseTo(0.6875);
  });

  it("handles very low electricity rate", () => {
    const result = calcPrinterHourlyCost(
      { powerWatts: 200, maintenanceCostPerHr: 0, purchasePrice: 0, lifespanHours: 0 },
      0.01
    );
    expect(result.electricity).toBeCloseTo(0.002);
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

  it("returns 0 for zero print time", () => {
    const cost = calcPrinterCost(
      { powerWatts: 200, maintenanceCostPerHr: 0.1, purchasePrice: 500, lifespanHours: 2000 },
      0.12,
      0
    );
    expect(cost).toBe(0);
  });

  it("scales linearly with time", () => {
    const params = { powerWatts: 200, maintenanceCostPerHr: 0.1, purchasePrice: 500, lifespanHours: 2000 };
    const cost1hr = calcPrinterCost(params, 0.12, 1);
    const cost3hr = calcPrinterCost(params, 0.12, 3);
    expect(cost3hr).toBeCloseTo(cost1hr * 3);
  });

  it("handles long print jobs", () => {
    const cost = calcPrinterCost(
      { powerWatts: 200, maintenanceCostPerHr: 0.07, purchasePrice: 600, lifespanHours: 4000 },
      0.1233,
      24
    );
    expect(cost).toBeGreaterThan(0);
    expect(cost).toBeLessThan(10);
  });
});

describe("calcLaborCost", () => {
  it("converts minutes to hours and multiplies", () => {
    expect(calcLaborCost(30, 15)).toBeCloseTo(7.5);
    expect(calcLaborCost(60, 15)).toBeCloseTo(15);
    expect(calcLaborCost(0, 15)).toBe(0);
  });

  it("handles fractional minutes", () => {
    expect(calcLaborCost(15, 20)).toBeCloseTo(5);
  });

  it("handles zero cost per hour", () => {
    expect(calcLaborCost(60, 0)).toBe(0);
  });

  it("handles large time values", () => {
    expect(calcLaborCost(480, 25)).toBeCloseTo(200);
  });
});

describe("calcCOGS", () => {
  it("sums all cost components", () => {
    const result = calcCOGS(3.84, 0.2, 0, 0);
    expect(result.total).toBeCloseTo(4.04);
    expect(result.filamentCost).toBe(3.84);
  });

  it("includes all components", () => {
    const result = calcCOGS(5, 2, 3, 1);
    expect(result.total).toBeCloseTo(11);
    expect(result.filamentCost).toBe(5);
    expect(result.printerCost).toBe(2);
    expect(result.laborCost).toBe(3);
    expect(result.suppliesCost).toBe(1);
  });

  it("handles all zeros", () => {
    const result = calcCOGS(0, 0, 0, 0);
    expect(result.total).toBe(0);
  });

  it("handles supplies-heavy model", () => {
    const result = calcCOGS(1.5, 0.3, 0, 8.5);
    expect(result.total).toBeCloseTo(10.3);
    expect(result.suppliesCost).toBe(8.5);
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

  it("handles zero price (free listing)", () => {
    const fees = calcEtsyFees(0, 0.2, 6.5, 3.0, 0.25);
    // Only fixed fees: listing 0.20 + processing fixed 0.25
    expect(fees).toBeCloseTo(0.45);
  });

  it("handles high-value item", () => {
    const fees = calcEtsyFees(500, 0.2, 6.5, 3.0, 0.25);
    expect(fees).toBeGreaterThan(45);
    expect(fees).toBeLessThan(55);
  });
});

describe("calcGenericFees", () => {
  it("applies referral percentage", () => {
    expect(calcGenericFees(100, 15)).toBeCloseTo(15);
    expect(calcGenericFees(20, 15)).toBeCloseTo(3);
  });

  it("handles zero price", () => {
    expect(calcGenericFees(0, 15)).toBe(0);
  });

  it("handles zero referral", () => {
    expect(calcGenericFees(100, 0)).toBe(0);
  });
});

describe("calcMarketplaceFees", () => {
  it("calculates Etsy fees correctly", () => {
    const fees = calcMarketplaceFees(20, etsyMarketplace);
    // listingFee: 0.20 + transaction: 20*6.5% = 1.30 + payment: 20*3% + 0.25 = 0.85
    expect(fees).toBeCloseTo(2.35);
  });

  it("calculates Amazon fees correctly", () => {
    const fees = calcMarketplaceFees(20, amazonMarketplace);
    // referral: 20 * 15% = 3.00
    expect(fees).toBeCloseTo(3.0);
  });

  it("returns 0 for marketplace with no fees", () => {
    const fees = calcMarketplaceFees(20, noFeeMarketplace);
    expect(fees).toBe(0);
  });

  it("handles zero price", () => {
    const fees = calcMarketplaceFees(0, etsyMarketplace);
    // Only fixed fees: listing 0.20 + processing fixed 0.25
    expect(fees).toBeCloseTo(0.45);
  });

  it("scales proportionally with price", () => {
    const fees10 = calcMarketplaceFees(10, amazonMarketplace);
    const fees20 = calcMarketplaceFees(20, amazonMarketplace);
    expect(fees20).toBeCloseTo(fees10 * 2);
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

  it("returns negative when costs exceed revenue", () => {
    expect(calcNetProfit(5, 0, 10, 2)).toBeCloseTo(-7);
  });

  it("handles zero price", () => {
    expect(calcNetProfit(0, 0, 5, 2)).toBeCloseTo(-7);
  });

  it("handles 50% discount", () => {
    // effective = 20 * 0.5 = 10, profit = 10 - 3 - 1 = 6
    expect(calcNetProfit(20, 50, 3, 1)).toBeCloseTo(6);
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

  it("returns 100% when COGS is 0", () => {
    expect(calcGrossMarginPct(20, 0)).toBeCloseTo(100);
  });

  it("returns negative margin when COGS exceeds price", () => {
    expect(calcGrossMarginPct(10, 15)).toBeCloseTo(-50);
  });
});

describe("calcNetMarginPct", () => {
  it("calculates net margin", () => {
    expect(calcNetMarginPct(9, 20)).toBeCloseTo(45);
  });

  it("returns 0 for zero price", () => {
    expect(calcNetMarginPct(5, 0)).toBe(0);
  });

  it("handles negative profit", () => {
    expect(calcNetMarginPct(-5, 20)).toBeCloseTo(-25);
  });

  it("handles break-even", () => {
    expect(calcNetMarginPct(0, 20)).toBe(0);
  });
});

describe("calcProfitPerHour", () => {
  it("divides profit by hours", () => {
    expect(calcProfitPerHour(4.45, 2)).toBeCloseTo(2.225);
  });

  it("returns 0 for zero hours", () => {
    expect(calcProfitPerHour(10, 0)).toBe(0);
  });

  it("handles negative profit", () => {
    expect(calcProfitPerHour(-6, 3)).toBeCloseTo(-2);
  });

  it("handles very short print times", () => {
    expect(calcProfitPerHour(5, 0.25)).toBeCloseTo(20);
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

  it("handles no-fee marketplace", () => {
    const price = calcSuggestedPrice(10, noFeeMarketplace, 50);
    // With no fees and 50% target margin: price = 10 / (1 - 0.50) = 20
    expect(price).toBeCloseTo(20);
  });

  it("returns fallback when target margin is too high", () => {
    // If target + fees > 100%, denominator <= 0, should return cogs * 3
    const price = calcSuggestedPrice(10, etsyMarketplace, 95);
    expect(price).toBeCloseTo(30); // cogs * 3
  });

  it("higher COGS produces higher suggested price", () => {
    const price5 = calcSuggestedPrice(5, etsyMarketplace, 45);
    const price10 = calcSuggestedPrice(10, etsyMarketplace, 45);
    expect(price10).toBeGreaterThan(price5);
  });

  it("higher target margin produces higher suggested price", () => {
    const price30 = calcSuggestedPrice(5, etsyMarketplace, 30);
    const price60 = calcSuggestedPrice(5, etsyMarketplace, 60);
    expect(price60).toBeGreaterThan(price30);
  });
});

describe("calcMarketplaceResult", () => {
  const cogs = calcCOGS(3.84, 0.2, 0, 0);

  it("returns full result object for Etsy", () => {
    const result = calcMarketplaceResult(9.88, 0, cogs, etsyMarketplace, 2);
    expect(result.marketplaceId).toBe(1);
    expect(result.marketplaceName).toBe("Etsy");
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

  it("discount reduces net profit", () => {
    const noDiscount = calcMarketplaceResult(20, 0, cogs, etsyMarketplace, 2);
    const withDiscount = calcMarketplaceResult(20, 20, cogs, etsyMarketplace, 2);
    expect(withDiscount.netProfit).toBeLessThan(noDiscount.netProfit);
  });

  it("returns negative profit for underpriced item", () => {
    const result = calcMarketplaceResult(1, 0, cogs, etsyMarketplace, 2);
    expect(result.netProfit).toBeLessThan(0);
    expect(result.netMarginPct).toBeLessThan(0);
  });

  it("returns zero profit per hour when print time is 0", () => {
    const result = calcMarketplaceResult(20, 0, cogs, etsyMarketplace, 0);
    expect(result.profitPerHour).toBe(0);
  });

  it("works with Amazon (referral-only fees)", () => {
    const result = calcMarketplaceResult(20, 0, cogs, amazonMarketplace, 2);
    expect(result.platformFees).toBeCloseTo(3.0); // 15% of 20
    expect(result.netProfit).toBeCloseTo(20 - 4.04 - 3.0);
  });

  it("works with no-fee marketplace", () => {
    const result = calcMarketplaceResult(20, 0, cogs, noFeeMarketplace, 2);
    expect(result.platformFees).toBe(0);
    expect(result.netProfit).toBeCloseTo(20 - 4.04);
  });

  it("gross margin is independent of fees", () => {
    const etsyResult = calcMarketplaceResult(20, 0, cogs, etsyMarketplace, 2);
    const amazonResult = calcMarketplaceResult(20, 0, cogs, amazonMarketplace, 2);
    // Gross margin only depends on listing price and COGS
    expect(etsyResult.grossMarginPct).toBeCloseTo(amazonResult.grossMarginPct);
  });
});
