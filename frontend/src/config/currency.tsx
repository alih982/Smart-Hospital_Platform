'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { localeConfig, type Locale } from '@/i18n/request';

// Currency types
export type Currency = 'USD' | 'EUR' | 'GBP' | 'IRR' | 'TRY' | 'SAR' | 'AED' | 'CNY';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  decimalSeparator: string;
  thousandSeparator: string;
  symbolPosition: 'before' | 'after';
  exchangeRate: number; // Rate relative to USD
}

export const currencyConfigs: Record<Currency, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimalSeparator: '.', thousandSeparator: ',', symbolPosition: 'before', exchangeRate: 1 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimalSeparator: ',', thousandSeparator: '.', symbolPosition: 'before', exchangeRate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimalSeparator: '.', thousandSeparator: ',', symbolPosition: 'before', exchangeRate: 0.79 },
  IRR: { code: 'IRR', symbol: '﷼', name: 'Iranian Rial', decimalSeparator: ',', thousandSeparator: ',', symbolPosition: 'after', exchangeRate: 42000 },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', decimalSeparator: ',', thousandSeparator: '.', symbolPosition: 'after', exchangeRate: 32 },
  SAR: { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', decimalSeparator: '.', thousandSeparator: ',', symbolPosition: 'after', exchangeRate: 3.75 },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', decimalSeparator: '.', thousandSeparator: ',', symbolPosition: 'after', exchangeRate: 3.67 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimalSeparator: '.', thousandSeparator: ',', symbolPosition: 'before', exchangeRate: 7.24 },
};

// Get currency for locale
export const getCurrencyForLocale = (locale: string): Currency => {
  return localeConfig[locale as Locale]?.currency as Currency || 'USD';
};

// Format price with currency
export const formatPrice = (
  amount: number,
  currency: Currency,
  locale: string = 'en-US'
): string => {
  const config = currencyConfigs[currency];
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'IRR' ? 0 : 2,
      maximumFractionDigits: currency === 'IRR' ? 0 : 2,
    }).format(amount);
  } catch {
    // Fallback formatting
    const formatted = new Intl.NumberFormat(locale).format(amount);
    return config.symbolPosition === 'before' 
      ? `${config.symbol}${formatted}`
      : `${formatted} ${config.symbol}`;
  }
};

// Convert price between currencies
export const convertPrice = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = currencyConfigs[fromCurrency].exchangeRate;
  const toRate = currencyConfigs[toCurrency].exchangeRate;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  format: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ 
  children, 
  initialCurrency 
}: { 
  children: ReactNode;
  initialCurrency?: Currency;
}) {
  const [currency, setCurrency] = useState<Currency>(initialCurrency || 'USD');

  const format = (amount: number): string => {
    return formatPrice(amount, currency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}

// Hook to get currency from locale
export function useCurrencyFromLocale(locale: string) {
  const [currency, setCurrency] = useState<Currency>(() => getCurrencyForLocale(locale));
  
  useEffect(() => {
    setCurrency(getCurrencyForLocale(locale));
  }, [locale]);
  
  return currency;
}

