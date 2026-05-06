-- 작업 2: viral_title_archive에 is_shorts 컬럼 추가 및 백필
-- Supabase 대시보드 SQL Editor에서 순서대로 실행

-- Step 1: 컬럼 추가
ALTER TABLE viral_title_archive
  ADD COLUMN IF NOT EXISTS is_shorts boolean DEFAULT false;

-- Step 2: viralboard_data의 is_shorts 값으로 백필
UPDATE viral_title_archive vta
SET is_shorts = vd.is_shorts
FROM viralboard_data vd
WHERE vta.video_id = vd.video_id;

-- 확인 쿼리 (선택)
-- SELECT is_shorts, COUNT(*) FROM viral_title_archive GROUP BY is_shorts;
