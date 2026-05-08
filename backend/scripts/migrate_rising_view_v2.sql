-- viralboard_rising VIEW v2: 실시간 델타 + 7일 이내 필터
-- 적용일: 2026-05-08
-- 변경 사유: 생애 평균 → 실시간 시간당 증가량 (history 테이블 활용)
-- 수동 실행: Supabase 대시보드 SQL Editor

DROP VIEW IF EXISTS viralboard_rising;

CREATE VIEW viralboard_rising AS
SELECT DISTINCT ON (d.video_id)
    d.id, d.video_id, d.category, d.country, d.title, d.channel, d.channel_id,
    d.views, d.likes, d.comments, d.duration_seconds, d.is_shorts,
    d.published_at, d.tags, d.thumbnail_url, d.fetched_at,
    d.reference_channel, d.style_tag, d.subscriber_count,
    d.channel_thumbnail_url, d.niche, d.estimated_cpm, d.viral_ratio,
    -- 실시간 델타 계산 (history 1시간 전 데이터 기준)
    CASE
      WHEN h.views IS NOT NULL AND h.fetched_at < d.fetched_at THEN
        GREATEST(
          (d.views - h.views) /
          GREATEST(EXTRACT(EPOCH FROM (d.fetched_at - h.fetched_at)) / 3600, 0.1),
          0
        )
      ELSE
        -- history 없으면 생애 평균 fallback
        d.views / GREATEST(EXTRACT(EPOCH FROM (NOW() - d.published_at)) / 3600, 1)
    END AS views_per_hour
FROM viralboard_data d
LEFT JOIN LATERAL (
  SELECT views, fetched_at
  FROM viralboard_history
  WHERE video_id = d.video_id
    AND country = d.country
    AND fetched_at < d.fetched_at - INTERVAL '30 minutes'
  ORDER BY fetched_at DESC
  LIMIT 1
) h ON true
WHERE d.published_at > NOW() - INTERVAL '7 days'  -- 1주일 이내만
ORDER BY d.video_id, d.viral_ratio DESC NULLS LAST;

-- 검증:
-- SELECT video_id, title, published_at, views_per_hour
-- FROM viralboard_rising
-- ORDER BY views_per_hour DESC LIMIT 10;
-- → 모두 7일 이내 + 시간당 증가량 정렬
