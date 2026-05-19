-- ============================================================================
-- 🎓 Youssef Automates - Add Certificate Columns to Courses Table
-- Run this script in your Supabase SQL Editor to add the missing certificate template columns.
-- ============================================================================

-- Add certificate columns to courses table if they do not exist
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificate_bg_url TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificate_text_color TEXT DEFAULT '#000000';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificate_name_x INTEGER DEFAULT 50;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificate_name_y INTEGER DEFAULT 40;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificate_name_size INTEGER DEFAULT 24;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificate_course_x INTEGER DEFAULT 50;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificate_course_y INTEGER DEFAULT 55;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificate_date_x INTEGER DEFAULT 50;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificate_date_y INTEGER DEFAULT 70;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificate_date_size INTEGER DEFAULT 14;

-- Reload postgrest schema cache to make columns visible immediately
NOTIFY pgrst, 'reload schema';
