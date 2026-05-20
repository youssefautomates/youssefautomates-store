-- Add promo_video_id column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS promo_video_id TEXT;
