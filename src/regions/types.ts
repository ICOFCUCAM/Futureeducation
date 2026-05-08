// ============================================
// Region System - Type Definitions
// ============================================

export type RegionId = 'africa' | 'middleEast' | 'europe' | 'northAmerica';

export interface GradeBand {
  minScore: number;
  maxScore: number;
  grade: string;
  gradePoint: number;
  remark: string;
}

export interface ClassificationBand {
  minCgpa: number;
  label: string;
  shortLabel: string;
}

export interface CreditSystem {
  unit: string;
  name: string;
  conversionToECTS: number;
}

export interface RegionTheme {
  primary: string;
  secondary: string;
  accent: string;
  motif: string;
}

export interface RegionConfig {
  id: RegionId;
  name: string;
  shortName: string;
  description: string;
  flagEmoji: string;
  countries: string[];
  defaultLocale: string;
  supportedLocales: string[];
  rtl: boolean;
  defaultCurrency: string;
  currencies: string[];
  defaultTimezone: string;
  dateFormat: string;
  numberFormat: string;
  nameOrder: 'given-family' | 'family-given' | 'patronymic';
  gpaScaleMax: number;
  gradeScale: GradeBand[];
  classification: ClassificationBand[];
  creditSystem: CreditSystem;
  academicCalendar: {
    startMonth: number;
    endMonth: number;
    semestersPerYear: number;
    description: string;
  };
  accreditationBodies: string[];
  paymentGateways: string[];
  complianceFrameworks: string[];
  idSchema: { name: string; pattern?: string }[];
  theme: RegionTheme;
  prayerTimeAware: boolean;
}
