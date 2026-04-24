-- viralboard_cpm_channels 테이블 컬럼 추가 마이그레이션
-- Supabase SQL Editor에서 실행

ALTER TABLE viralboard_cpm_channels
  ADD COLUMN IF NOT EXISTS keyword_niche    TEXT,
  ADD COLUMN IF NOT EXISTS keyword          TEXT,
  ADD COLUMN IF NOT EXISTS total_view_count BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_count      INT    DEFAULT 0,
  ADD COLUMN IF NOT EXISTS thumbnail_url    TEXT,
  ADD COLUMN IF NOT EXISTS snapshot_date    DATE;

-- (channel_id, keyword_niche) 복합 유니크 제약 추가
-- upsert on_conflict='channel_id,keyword_niche' 동작에 필요
ALTER TABLE viralboard_cpm_channels
  DROP CONSTRAINT IF EXISTS viralboard_cpm_channels_pkey CASCADE;

ALTER TABLE viralboard_cpm_channels
  ADD CONSTRAINT viralboard_cpm_channels_pkey
  PRIMARY KEY (channel_id, keyword_niche);
