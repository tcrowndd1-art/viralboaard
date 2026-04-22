-- ViralBoard Supabase 스키마 v2
-- 스펙: 4국가 (KR/BR/US/JP), 12카테고리, 플라이휠 #1

CREATE TABLE IF NOT EXISTS viralboard_data (
  id BIGSERIAL PRIMARY KEY,
  video_id TEXT NOT NULL,
  category TEXT NOT NULL,
  country TEXT NOT NULL CHECK (country IN ('KR','BR','US','JP')),
  title TEXT,
  channel TEXT,
  channel_id TEXT,
  views BIGINT,
  likes BIGINT,
  comments BIGINT,
  duration_seconds INT,
  is_shorts BOOLEAN GENERATED ALWAYS AS (duration_seconds <= 60) STORED,
  published_at TIMESTAMPTZ,
  tags TEXT[],
  thumbnail_url TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, country)
);

CREATE INDEX IF NOT EXISTS idx_data_category_views ON viralboard_data(category, views DESC);
CREATE INDEX IF NOT EXISTS idx_data_shorts ON viralboard_data(is_shorts, views DESC);
CREATE INDEX IF NOT EXISTS idx_data_country_cat ON viralboard_data(country, category, fetched_at DESC);

CREATE TABLE IF NOT EXISTS viralboard_history (
  id BIGSERIAL PRIMARY KEY,
  video_id TEXT NOT NULL,
  category TEXT NOT NULL,
  country TEXT NOT NULL CHECK (country IN ('KR','BR','US','JP')),
  title TEXT,
  channel TEXT,
  views BIGINT,
  likes BIGINT,
  comments BIGINT,
  duration_seconds INT,
  published_at TIMESTAMPTZ,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_snapshot ON viralboard_history(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_history_video_time ON viralboard_history(video_id, fetched_at DESC);

ALTER TABLE viralboard_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE viralboard_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_all_data" ON viralboard_data FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_all_history" ON viralboard_history FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "public_read_data" ON viralboard_data FOR SELECT USING (true);
CREATE POLICY "no_delete_history" ON viralboard_history FOR DELETE USING (false);

CREATE OR REPLACE VIEW viralboard_rising AS
SELECT
  d.video_id, d.title, d.channel, d.category, d.country, d.is_shorts,
  d.views AS current_views, h.views AS previous_views,
  (d.views - h.views) AS view_delta,
  EXTRACT(EPOCH FROM (d.fetched_at - h.fetched_at))/3600 AS hours_diff,
  CASE WHEN EXTRACT(EPOCH FROM (d.fetched_at - h.fetched_at))/3600 > 0
    THEN ROUND((d.views - h.views) / (EXTRACT(EPOCH FROM (d.fetched_at - h.fetched_at))/3600))
    ELSE 0 END AS views_per_hour,
  d.thumbnail_url, d.fetched_at
FROM viralboard_data d
JOIN LATERAL (
  SELECT views, fetched_at FROM viralboard_history
  WHERE video_id = d.video_id AND country = d.country
  AND fetched_at < d.fetched_at
  ORDER BY fetched_at DESC LIMIT 1
) h ON true
WHERE d.views > h.views
ORDER BY views_per_hour DESC;
