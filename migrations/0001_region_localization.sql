-- ============================================
-- Phase 0: Region & Localization
-- Adds region/locale/timezone/currency to profiles
-- and creates a region_configs reference table.
-- ============================================

-- Reference table for available regions
CREATE TABLE IF NOT EXISTS region_configs (
  id              text PRIMARY KEY,
  name            text NOT NULL,
  default_locale  text NOT NULL,
  default_currency text NOT NULL,
  default_timezone text NOT NULL,
  rtl             boolean NOT NULL DEFAULT false,
  gpa_scale_max   numeric(3,1) NOT NULL,
  credit_unit     text NOT NULL,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

INSERT INTO region_configs (id, name, default_locale, default_currency, default_timezone, rtl, gpa_scale_max, credit_unit)
VALUES
  ('africa',       'Africa',         'en', 'NGN', 'Africa/Lagos',     false, 5.0, 'CU'),
  ('middleEast',   'Middle East',    'ar', 'SAR', 'Asia/Riyadh',      true,  5.0, 'SCH'),
  ('europe',       'Europe',         'en', 'EUR', 'Europe/Brussels',  false, 4.0, 'ECTS'),
  ('northAmerica', 'North America',  'en', 'USD', 'America/New_York', false, 4.0, 'CR')
ON CONFLICT (id) DO NOTHING;

-- Add region/localization columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS region    text REFERENCES region_configs(id) DEFAULT 'africa',
  ADD COLUMN IF NOT EXISTS locale    text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS timezone  text DEFAULT 'Africa/Lagos',
  ADD COLUMN IF NOT EXISTS currency  text DEFAULT 'NGN';

CREATE INDEX IF NOT EXISTS idx_profiles_region ON profiles(region);

-- Optional: per-institution defaults if multi-tenant
CREATE TABLE IF NOT EXISTS institutions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  short_name      text,
  region          text NOT NULL REFERENCES region_configs(id),
  default_locale  text NOT NULL DEFAULT 'en',
  default_currency text NOT NULL,
  default_timezone text NOT NULL,
  accreditation   text[],
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_institutions_region ON institutions(region);
