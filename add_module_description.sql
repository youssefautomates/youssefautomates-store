-- ============================================================================
-- 🎓 Youssef Automates - Add description column to course_modules Table
-- Run this script in your Supabase SQL Editor to fix the missing column error.
-- ============================================================================

ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS description TEXT;

-- Reload postgrest schema cache to make column visible immediately
NOTIFY pgrst, 'reload schema';
