# Supabase 스키마 v2 적용 가이드

## David 수동 1회 실행

1. Supabase 대시보드 → SQL Editor
2. viralboard_schema_v2.sql 전체 복사 → Run
3. Tables 탭에서 viralboard_data, viralboard_history 확인
4. Database → Views에서 viralboard_rising 확인

## 검증 쿼리

SELECT table_name FROM information_schema.tables 
WHERE table_schema='public' AND table_name LIKE 'viralboard_%';

기대: 2개 테이블

## 주의

- 기존 viralboard_data 있으면 별도 백업 후 DROP 필요
- country CHECK: KR/BR/US/JP만 허용
- is_shorts 자동 계산 (duration_seconds <= 60)
