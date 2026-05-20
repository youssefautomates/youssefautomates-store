-- ============================================================================
-- 🎓 Youssef Automates - Add Showcase Videos Column to Courses Table (Phase 7)
-- Migration: 20260519130000_course_showcase_videos.sql
-- ============================================================================

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS showcase_videos JSONB DEFAULT '[]'::jsonb;
