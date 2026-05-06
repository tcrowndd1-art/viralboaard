-- viralboard_rising VIEW: dedup + views_per_hour
-- 적용일: 2026-05-06
-- Supabase 대시보드에서 직접 실행 후 사후 파일화

DROP VIEW IF EXISTS viralboard_rising;

CREATE VIEW viralboard_rising AS
SELECT DISTINCT ON (d.video_id)
    d.id, d.video_id, d.category, d.country, d.title, d.channel, d.channel_id,
    d.views, d.likes, d.comments, d.duration_seconds, d.is_shorts,
    d.published_at, d.tags, d.thumbnail_url, d.fetched_at,
    d.reference_channel, d.style_tag, d.subscriber_count,
    d.channel_thumbnail_url, d.niche, d.estimated_cpm, d.viral_ratio,
    CASE
        WHEN EXTRACT(EPOCH FROM (NOW() - d.published_at))/3600 > 0
        THEN d.views / (EXTRACT(EPOCH FROM (NOW() - d.published_at))/3600)
        ELSE 0
    END AS views_per_hour
FROM viralboard_data d
ORDER BY d.video_id, d.viral_ratio DESC NULLS LAST;
