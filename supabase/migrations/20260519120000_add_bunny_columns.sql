-- ============================================================================
-- 🎓 Youssef Automates - Add Bunny Stream Integration Columns (Phase 6)
-- Migration: 20260519120000_add_bunny_columns.sql
-- ============================================================================

ALTER TABLE public.course_lessons 
ADD COLUMN IF NOT EXISTS video_id TEXT,
ADD COLUMN IF NOT EXISTS playback_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
