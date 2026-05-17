"use client";

import { createContext, useContext } from "react";
import { formatCurrency as baseFmt } from "@/utils/formatters";

interface CurrencyContextValue {
  currency: string;
  symbol: string;
  fmt: (value: number) => string;
}

function getSymbol(currency: string): string {
  return (
    new Intl.NumberFormat("en-US", { style: "currency", currency })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? "$"
  );
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "USD",
  symbol: "$",
  fmt: (v) => baseFmt(v, "USD"),
});

export function CurrencyProvider({
  currency,
  children,
}: {
  currency: string;
  children: React.ReactNode;
}) {
  const symbol = getSymbol(currency);
  const fmt = (value: number) => baseFmt(value, currency);
  return (
    <CurrencyContext.Provider value={{ currency, symbol, fmt }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
