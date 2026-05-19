-- ============================================================================
-- 🎓 Youssef Automates - Certificate Custom Font Sizes
-- Migration: 20260519090000_certificate_font_sizes.sql
-- ============================================================================

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificate_name_size INTEGER DEFAULT 24;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificate_date_size INTEGER DEFAULT 14;
