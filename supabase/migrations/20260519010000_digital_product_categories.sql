-- Migration to normalize and enforce digital product categories
-- Categories: 'الأتمتة', 'الذكاء الاصطناعي', 'صناعة المحتوى'

-- 1. First, map existing products categories safely to ensure no data is broken or constraint violations occur
UPDATE public.products
SET category = CASE
    -- Map n8n / productivity / automation to الأتمتة
    WHEN category ILIKE '%n8n%' OR category ILIKE '%productivity%' OR category ILIKE '%أتمتة%' OR category ILIKE '%التسويق%' OR category ILIKE '%التجارة%' THEN 'الأتمتة'
    -- Map AI / smart to الذكاء الاصطناعي
    WHEN category ILIKE '%ai%' OR category ILIKE '%ذكاء%' OR category ILIKE '%الذكاء%' THEN 'الذكاء الاصطناعي'
    -- Map content / social / media to صناعة المحتوى
    WHEN category ILIKE '%content%' OR category ILIKE '%صناعة%' OR category ILIKE '%ميديا%' OR category ILIKE '%سوشيال%' THEN 'صناعة المحتوى'
    -- Fallback for any other non-null categories to 'الأتمتة'
    WHEN category IS NOT NULL AND category NOT IN ('الأتمتة', 'الذكاء الاصطناعي', 'صناعة المحتوى') THEN 'الأتمتة'
    ELSE category
END;

-- 2. Ensure default category is 'الأتمتة'
ALTER TABLE public.products ALTER COLUMN category SET DEFAULT 'الأتمتة';

-- 3. Add CHECK constraint to validate that category can only be one of the three specified categories or NULL
-- Remove existing check constraint if it exists first
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;

ALTER TABLE public.products 
ADD CONSTRAINT products_category_check 
CHECK (category IS NULL OR category IN ('الأتمتة', 'الذكاء الاصطناعي', 'صناعة المحتوى'));
