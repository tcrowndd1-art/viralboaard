-- viralboard_alter_v2b.sql
-- Fetcher Phase 1에 필요한 추가 컬럼
-- David 수동 실행 (viralboard_schema_v2.sql 이후)

ALTER TABLE viralboard_data
  ADD COLUMN IF NOT EXISTS reference_channel BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS style_tag TEXT,
  ADD COLUMN IF NOT EXISTS actual_width INT,
  ADD COLUMN IF NOT EXISTS actual_height INT;

ALTER TABLE viralboard_history
  ADD COLUMN IF NOT EXISTS reference_channel BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS style_tag TEXT,
  ADD COLUMN IF NOT EXISTS actual_width INT,
  ADD COLUMN IF NOT EXISTS actual_height INT;
