-- --- Add Bunny Stream Columns to course_lessons ---
ALTER TABLE public.course_lessons 
ADD COLUMN IF NOT EXISTS video_id TEXT,
ADD COLUMN IF NOT EXISTS playback_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
