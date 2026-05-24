-- ============================================================================
-- 🎓 Youssef Automates - Orders Table Dual Pricing Migration
-- Migration: 20260524080000_orders_dual_pricing.sql
-- ============================================================================

-- 1. Alter public.orders table to add auditing and snapshotting columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS original_amount_usd NUMERIC(10,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS charged_amount_egp NUMERIC(10,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(10,4);

-- 2. Document the columns with comments for clear database design
COMMENT ON COLUMN public.orders.original_amount_usd IS 'Locks the original purchase price in USD for international clients';
COMMENT ON COLUMN public.orders.charged_amount_egp IS 'Locks the exact converted EGP amount billed to customer via Paymob';
COMMENT ON COLUMN public.orders.exchange_rate IS 'Locks the live exchange rate applied at checkout moment (USD to EGP)';
