-- ============================================================================
-- 🎓 Youssef Automates - Add Showcase Videos Column to Courses Table
-- Run this script in your Supabase SQL Editor to add the showcase_videos column.
-- ============================================================================

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS showcase_videos JSONB DEFAULT '[]'::jsonb;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
