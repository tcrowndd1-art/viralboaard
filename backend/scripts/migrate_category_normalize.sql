-- 카테고리 대소문자/하이픈 정규화
-- 적용일: 2026-05-07
-- 영향 row: ~700건 (Self-Dev 327 + Science 294 + Psychology 255 + Entertainment 17)
-- 수동 실행: Supabase 대시보드 SQL Editor

-- viralboard_data
UPDATE viralboard_data SET category = 'self_dev'      WHERE category = 'Self-Dev';
UPDATE viralboard_data SET category = 'science'       WHERE category = 'Science';
UPDATE viralboard_data SET category = 'psychology'    WHERE category = 'Psychology';
UPDATE viralboard_data SET category = 'entertainment' WHERE category = 'Entertainment';

-- viralboard_history (이력 데이터도 동일 정규화)
UPDATE viralboard_history SET category = 'self_dev'      WHERE category = 'Self-Dev';
UPDATE viralboard_history SET category = 'science'       WHERE category = 'Science';
UPDATE viralboard_history SET category = 'psychology'    WHERE category = 'Psychology';
UPDATE viralboard_history SET category = 'entertainment' WHERE category = 'Entertainment';

-- 검증 쿼리
SELECT category, count(*) FROM viralboard_data GROUP BY category ORDER BY count DESC;
