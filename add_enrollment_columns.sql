-- ============================================================================
-- 🎓 Youssef Automates - Add user_name and user_email to public.enrollments
-- Run this script in your Supabase SQL Editor to support student management.
-- ============================================================================

ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Reload postgrest schema cache to make columns visible immediately
NOTIFY pgrst, 'reload schema';
