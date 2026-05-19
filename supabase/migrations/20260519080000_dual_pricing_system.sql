-- ============================================================================
-- 🎓 Youssef Automates - Enterprise Dual Pricing System Migration
-- Migration: 20260519080000_dual_pricing_system.sql
-- ============================================================================

-- 1. Update public.courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price_egp NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS original_price_egp NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price_usd NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS original_price_usd NUMERIC(10,2) DEFAULT 0;

-- 2. Update public.products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_egp NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price_egp NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_usd NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price_usd NUMERIC(10,2) DEFAULT 0;

-- 3. Update public.bundles table
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS price_egp NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS original_price_egp NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS price_usd NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS original_price_usd NUMERIC(10,2) DEFAULT 0;

-- 4. Intelligent data backfill rule:
-- If price is <= 100 (likely USD), set price_usd = price and price_egp = price * 50.
-- If price is > 100 (likely EGP), set price_egp = price and price_usd = price / 50.
UPDATE public.products 
SET 
  price_usd = CASE WHEN price <= 100 THEN price ELSE ROUND(price / 50.0, 2) END,
  original_price_usd = CASE WHEN original_price <= 100 THEN original_price ELSE ROUND(original_price / 50.0, 2) END,
  price_egp = CASE WHEN price > 100 THEN price ELSE ROUND(price * 50.0, 2) END,
  original_price_egp = CASE WHEN original_price > 100 THEN original_price ELSE ROUND(original_price * 50.0, 2) END
WHERE price > 0;
