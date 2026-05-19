-- ============================================================================
-- 🎓 Youssef Automates - Add description column to course_modules Table
-- ============================================================================

ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS description TEXT;

NOTIFY pgrst, 'reload schema';
