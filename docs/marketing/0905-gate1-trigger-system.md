---
date: 2026-05-10
type: marketing
target: Gate 1 Strategy Appendix
---

# GP4: Gate 1 Trigger System 명세

### 1. 회원 카운트 측정 (Supabase Auth)
- **측정 위치:** Supabase 내장 `auth.users` 테이블의 `email_confirmed_at` 필드 확인.
- **방법:** `SELECT count(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL` 쿼리를 통해 실제 활성 회원수 집계.

### 2. 자동 알림 시스템 (Telegram Bot)
- **트리거:** 유저 수 100명 도달 시 Supabase Edge Function이 Telegram Bot API 호출.
- **알림 채널:** David 및 핵심 팀원 전용 텔레그램 채널.

### 3. 핵심 측정 지표 (Viral 5)
1. **가입자 수:** 이메일 인증 완료 유저 (Target 100).
2. **활성 유저:** 주 2회 이상 접속자.
3. **DAU:** 일간 활성 사용자 수.
4. **영상 발견율:** 유저당 일평균 Rising 영상 클릭/저장 횟수.
5. **리텐션:** 가입 1주일 후 재접속 비율 (D+7 Retention).

### 4. AI Studio 자동 트리거 조건
- 가입자 100명 돌파 + BYOK(API 키 등록) 활성화율 30% 이상 시 Phase 2(AI Studio 개발) 즉시 착수.
