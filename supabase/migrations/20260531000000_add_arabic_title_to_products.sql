-- ============================================================================
-- 🎓 Youssef Automates - Add Arabic Title Support to Products Table
-- Migration: 20260531000000_add_arabic_title_to_products.sql
-- ============================================================================

-- Add arabic_title column to products table for clean data localization
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS arabic_title TEXT;
