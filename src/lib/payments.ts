// ============================================
// Region-aware payments — gateway catalogue + types
// ============================================

import type { RegionId } from '@/regions';

export type GatewayKind = 'card' | 'bank' | 'mobile-money' | 'wallet' | 'crypto' | 'sepa' | 'ach';

export interface PaymentGateway {
  id: string;
  name: string;
  kinds: GatewayKind[];
  regions: RegionId[];
  currencies: string[];
  feeBps: number;
  description: string;
  logo?: string;
}

export const gateways: PaymentGateway[] = [
  // Africa
  { id: 'paystack',   name: 'Paystack',     kinds: ['card', 'bank', 'mobile-money'], regions: ['africa'], currencies: ['NGN', 'GHS', 'ZAR', 'KES', 'USD'], feeBps: 150, description: 'Nigeria-led card + bank rails across West Africa.' },
  { id: 'flutterwave', name: 'Flutterwave', kinds: ['card', 'bank', 'mobile-money'], regions: ['africa'], currencies: ['NGN', 'GHS', 'KES', 'UGX', 'TZS', 'XOF', 'USD', 'EUR'], feeBps: 140, description: '34-country pan-African coverage.' },
  { id: 'mpesa',      name: 'M-Pesa',       kinds: ['mobile-money'],                  regions: ['africa'], currencies: ['KES', 'TZS'], feeBps: 100, description: 'Mobile money — Kenya, Tanzania.' },
  { id: 'mtn-momo',   name: 'MTN MoMo',     kinds: ['mobile-money'],                  regions: ['africa'], currencies: ['GHS', 'UGX', 'XOF', 'RWF'], feeBps: 100, description: 'Mobile money across MTN markets.' },
  { id: 'orange-money', name: 'Orange Money', kinds: ['mobile-money'],                regions: ['africa'], currencies: ['XOF', 'EGP', 'MAD'], feeBps: 100, description: 'Francophone Africa mobile money.' },

  // Middle East
  { id: 'hyperpay',   name: 'HyperPay',     kinds: ['card', 'wallet'],                regions: ['middleEast'], currencies: ['SAR', 'AED', 'QAR', 'KWD'], feeBps: 220, description: 'Gulf-focused PSP, KSA & UAE leader.' },
  { id: 'payfort',    name: 'Amazon Payment Services', kinds: ['card'],               regions: ['middleEast'], currencies: ['SAR', 'AED', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'EGP'], feeBps: 200, description: 'Formerly Payfort — wide MENA coverage.' },
  { id: 'telr',       name: 'Telr',         kinds: ['card', 'wallet'],                regions: ['middleEast'], currencies: ['AED', 'SAR', 'USD'], feeBps: 250, description: 'UAE-based PSP for SMB universities.' },
  { id: 'paytabs',    name: 'PayTabs',      kinds: ['card'],                          regions: ['middleEast'], currencies: ['SAR', 'AED', 'EGP', 'JOD', 'OMR'], feeBps: 220, description: 'Saudi-based PSP across MENA.' },

  // Europe
  { id: 'stripe-eu',  name: 'Stripe (EU)',  kinds: ['card', 'sepa', 'wallet'],        regions: ['europe', 'northAmerica'], currencies: ['EUR', 'GBP', 'CHF', 'SEK', 'PLN', 'USD', 'CAD'], feeBps: 140, description: 'PCI-compliant cards + SEPA Direct Debit.' },
  { id: 'mollie',     name: 'Mollie',       kinds: ['card', 'sepa', 'wallet'],        regions: ['europe'], currencies: ['EUR', 'GBP'], feeBps: 130, description: 'Dutch PSP, strong iDEAL/Bancontact support.' },
  { id: 'adyen',      name: 'Adyen',        kinds: ['card', 'sepa', 'wallet'],        regions: ['europe', 'northAmerica'], currencies: ['EUR', 'GBP', 'USD', 'SEK', 'NOK', 'DKK'], feeBps: 120, description: 'Enterprise-grade, all of Europe + global.' },
  { id: 'klarna',     name: 'Klarna',       kinds: ['card'],                          regions: ['europe'], currencies: ['EUR', 'GBP', 'SEK', 'NOK', 'DKK'], feeBps: 290, description: 'Buy-now-pay-later for tuition splits.' },

  // North America
  { id: 'stripe-us',  name: 'Stripe',       kinds: ['card', 'wallet'],                regions: ['northAmerica'], currencies: ['USD', 'CAD'], feeBps: 290, description: 'Industry-standard cards, Apple/Google Pay.' },
  { id: 'plaid-ach',  name: 'Plaid + ACH',  kinds: ['ach', 'bank'],                   regions: ['northAmerica'], currencies: ['USD'], feeBps: 80, description: 'Direct-from-bank ACH, lowest fees.' },
  { id: 'paypal',     name: 'PayPal',       kinds: ['wallet', 'card'],                regions: ['northAmerica', 'europe'], currencies: ['USD', 'CAD', 'EUR', 'GBP'], feeBps: 340, description: 'Global wallet, parent-friendly.' },

  // Cross-region crypto rails
  { id: 'usdc-onchain', name: 'USDC (Stablecoin)', kinds: ['crypto'],                  regions: ['africa', 'middleEast', 'europe', 'northAmerica'], currencies: ['USD'], feeBps: 30, description: 'On-chain stablecoin — instant cross-border.' },
];

export function gatewaysFor(regionId: RegionId, currency?: string): PaymentGateway[] {
  return gateways.filter((g) =>
    g.regions.includes(regionId) &&
    (!currency || g.currencies.includes(currency)),
  );
}

export interface TuitionFee {
  programType: string;
  level: number;
  baseAmountUSD: number;
}

const tuitionTable: Record<RegionId, TuitionFee[]> = {
  africa: [
    { programType: 'B.Sc.', level: 100, baseAmountUSD: 800 },
    { programType: 'B.Sc.', level: 200, baseAmountUSD: 800 },
    { programType: 'B.Sc.', level: 300, baseAmountUSD: 900 },
    { programType: 'B.Sc.', level: 400, baseAmountUSD: 1000 },
    { programType: 'M.Sc.', level: 100, baseAmountUSD: 1500 },
    { programType: 'PhD',   level: 100, baseAmountUSD: 2200 },
  ],
  middleEast: [
    { programType: 'B.Sc.', level: 100, baseAmountUSD: 4500 },
    { programType: 'B.Sc.', level: 200, baseAmountUSD: 4500 },
    { programType: 'B.Sc.', level: 300, baseAmountUSD: 5000 },
    { programType: 'B.Sc.', level: 400, baseAmountUSD: 5500 },
    { programType: 'M.Sc.', level: 100, baseAmountUSD: 8000 },
    { programType: 'PhD',   level: 100, baseAmountUSD: 11000 },
  ],
  europe: [
    { programType: 'B.Sc.', level: 100, baseAmountUSD: 3500 },
    { programType: 'B.Sc.', level: 200, baseAmountUSD: 3500 },
    { programType: 'B.Sc.', level: 300, baseAmountUSD: 4000 },
    { programType: 'B.Sc.', level: 400, baseAmountUSD: 4500 },
    { programType: 'M.Sc.', level: 100, baseAmountUSD: 6500 },
    { programType: 'PhD',   level: 100, baseAmountUSD: 9000 },
  ],
  northAmerica: [
    { programType: 'B.Sc.', level: 100, baseAmountUSD: 22000 },
    { programType: 'B.Sc.', level: 200, baseAmountUSD: 22000 },
    { programType: 'B.Sc.', level: 300, baseAmountUSD: 23000 },
    { programType: 'B.Sc.', level: 400, baseAmountUSD: 24000 },
    { programType: 'M.Sc.', level: 100, baseAmountUSD: 32000 },
    { programType: 'PhD',   level: 100, baseAmountUSD: 38000 },
  ],
};

const usdToCurrency: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, CHF: 0.88, CAD: 1.36,
  NGN: 1450, GHS: 12, ZAR: 18.5, KES: 130, EGP: 48, XOF: 600, ETB: 56,
  TZS: 2400, UGX: 3800, RWF: 1300, MAD: 10,
  SAR: 3.75, AED: 3.67, QAR: 3.64, KWD: 0.31, BHD: 0.38, OMR: 0.38, JOD: 0.71,
  ILS: 3.7, LBP: 89500,
  SEK: 10.5, PLN: 4.0, NOK: 10.6, DKK: 6.85,
};

export function tuitionFor(regionId: RegionId, programType: string, level: number, currency: string): number {
  const table = tuitionTable[regionId];
  const row = table.find((r) => r.programType === programType && r.level === level)
    || table.find((r) => r.programType === programType)
    || table[0];
  const rate = usdToCurrency[currency] ?? 1;
  return Math.round(row.baseAmountUSD * rate);
}
