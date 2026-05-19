-- ============================================================================
-- 🎓 Youssef Automates - Add user_name and user_email to Enrollments Table
-- ============================================================================

ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS user_email TEXT;

NOTIFY pgrst, 'reload schema';
