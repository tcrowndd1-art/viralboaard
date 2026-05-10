---
date: 2026-05-10
type: audit
target: Launch Readiness Appendix
---

# GP5: 출시 차단선(Launch Blockers) 명세

### 1. Supabase Auth 연동
- **SDK:** `@supabase/auth-helpers-react` 권장 (Vite 환경의 SSR/CSR 세션 유지 최적화).
- **흐름:** Sign-up(이메일 인증) -> Sign-in -> Session Persistence.
- **보호 라우트:** `src/hooks/useAuth.tsx` 내 `AuthProvider`를 활용하여 비인증 사용자 `/login` 리다이렉트.
- **코드 위치:** `src/router/config.tsx`의 `element`를 `AuthGuard` 컴포넌트로 래핑.

### 2. YouTube API 키 Revoke 및 신규 발급
- **노출 키 식별:** `AIzaSyD2jm...` 등 초기 로그 및 `.env.example`에 노출된 모든 키.
- **Console 경로:** Google Cloud Console -> APIs & Services -> Credentials.
- **조치:** 기존 키 즉시 'Delete', 신규 키 7개 발급 후 `HTTP Referrer` 제한 설정.

### 3. 배포 환경 비교 (Vite React 호환)
- **Vercel:** DX 최상, 하지만 팀 단위 Seat 비용($20/dev) 및 대역폭 추가 비용 부담.
- **Netlify:** 팀 단위 고정 비용($20/mo), 배포 속도 안정적.
- **Cloudflare Pages (권장):** **대역폭 무제한(Unlimited Egress)**, Edge Workers 기반 최저 지연 시간, 무료 티어 확장성 최고.
- **권장:** ViralBoard는 데이터 전송량이 많으므로 'Cloudflare Pages'가 최선.
