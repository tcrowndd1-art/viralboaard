---
source: c:\Ai_Wiki\.claude\learnings\rejected-patterns.md (마스터)
sync_policy: master → project (단방향)
project_specific: 마스터에 없는 ViralBoard 특화 패턴만 아래 추가
last_synced: 2026-05-10
---

# Rejected Patterns
> 3회 실패 또는 BLOCKED 레벨 시 등재. 30세션 재발 없음 시 졸업.

## 등재 조건
- 자동: 동일 세션 3회 실패 + 기존 패턴 없음
- 수동: BLOCKED 레벨 1회 (보안·비용·데이터 유출)
- 증거 필수 (grep/커밋/로그 중 1개). 수사어·추상 규칙 거부.

---

## 🔴 CRITICAL (영구, 졸업 없음)

### #008: AI raw 출력 요청 (키 노출)
**등재**: 2026-04-22 | CRITICAL | 세션: #005
**위반**: "결과 알려줘" → 사용자 복붙 → YouTube key 채팅 평문 노출
**금지**:
- "결과 알려줘" / "에러 메시지 알려줘" 단독 요청
- raw stdout/stderr 전체 공유 요청
- URL·토큰 전체 복사 요청
**대체**:
- 출력 형식 강제 ("성공/실패만", "마지막 5줄만")
- 키·토큰 포함 시 가림 명시 ("***로 가려서")
- 구조화 보고 (✅/❌ + 코드만)
**검증**: 응답에 "결과 알려줘" 단독 패턴 0건

---

## 📋 STANDARD (30세션 졸업 가능)

### #001: Silent Error Swallowing (에러 삼킴)
**등재**: 2026-04-22 | 26건 실측 | 세션: #001
**위반**: `fetchPopularChannels().catch(() => {})` — 에러 무시, 빈 화면 노출
**금지**:
- `catch {}` 빈 블록
- `.catch(() => {})` 핸들러 없음
- 에러 시 사용자 피드백 0건
**대체**:
- API 에러 → `setError(e.message)` + UI 에러 상태
- localStorage/clipboard 에러 → `catch {}` 예외 허용
- 사용자 액션 에러 → toast 또는 인라인 메시지
**검증**: `grep -rn 'catch.*{}\|catch\s*{$' src/ | grep -v "localStorage\|clipboard"` → 0건

---

### #002: VITE_ API Key 클라이언트 직접 노출
**등재**: 2026-04-22 | BLOCKED | 5파일 실측 | 세션: #001
**위반**: `const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY` — 번들에 키 포함
**금지**:
- `VITE_*_KEY`, `VITE_*_TOKEN`, `VITE_*_SECRET` 클라이언트 번들 직접 포함
- 프론트 소스에서 `import.meta.env`로 비밀 키 직접 사용
- 배포 전 프록시 미교체
**대체**:
- YouTube/OpenRouter → Supabase Edge Function 또는 프록시 경유
- 클라이언트는 `/api/proxy` 호출만
- VITE_ = anon key·공개 URL·모델명만
**검증**: `grep -rn "VITE_.*KEY\|VITE_.*TOKEN\|VITE_.*SECRET" src/` → 0건

---

### #003: 프론트 외부 API 직접 호출 (quota 폭발)
**등재**: 2026-04-22 | 3회 | 세션: f83ab59
**위반**: React 컴포넌트에서 googleapis.com 직접 호출 → 25명 접속으로 하루 quota 소진
**금지**:
- 프론트에서 유료 외부 API(YouTube, OpenAI 등) 직접 호출
- search.list 등 고비용 엔드포인트 사용 (100 units/call)
- VITE_ 접두사로 API 키 프론트 노출
**대체**:
- 백엔드(Python/Node)에서만 API 호출
- 결과를 Supabase에 캐시
- 프론트는 Supabase SELECT만
**검증**: `grep -rn "googleapis.com\|openai.com\|anthropic.com" src/` → 0건

---

### #006: GitHub 토큰 git remote URL 노출
**등재**: 2026-04-22 | BLOCKED | 1회 | 세션: 오늘
**위반**: `https://ghp_xxx@github.com/repo.git` remote 설정 → git remote -v로 토큰 노출
**금지**:
- git remote URL에 토큰 직접 포함
- `git remote -v` 결과 스크린샷/복사 공유
- 터미널 히스토리에 토큰 평문 저장
**대체**:
- SSH 인증 (`git@github.com:user/repo.git`)
- HTTPS 필수 시 git credential manager 사용
- 토큰은 환경변수 `GITHUB_TOKEN`으로 분리
**검증**: `git remote -v | grep -E "ghp_|github_pat_"` → 0건

---

### #009: CLI 명령어 dry-run 미실시 후 워크플로우 등재
**등재**: 2026-05-07 | STANDARD | 세션: 0c3894ba
**위반**: `gemini -p "..."` 명령어를 실제 실행 검증 없이 CLAUDE.md/GEMINI.md 워크플로우에 등재 → 헤드리스 실행 시 `--skip-trust` 미포함으로 exit code 55 실패 (커밋 d4d38e9 이후 발견)
**금지**:
- 신규 CLI 명령어·플래그를 workflow에 등재하기 전 실제 실행 검증 생략
- "아마 될 것"으로 워크플로우 문서화 후 배포
- 플래그 조합 추정만으로 공식화
**대체**:
- 워크플로우 등재 전 Claude Code 환경에서 1회 직접 실행 → 성공 확인
- 실패 시 플래그 정정 후 재실행 → 통과 후 등재
- 발견된 플래그 변경사항은 즉시 해당 워크플로우 문서에 반영
**검증**: `git log --grep="fix.*workflow\|fix.*flag"` → 등재 후 수정 커밋 0건

---

### #013: 자기 보고 자기 검증 (작업 AI = 검증 AI)
**등재**: 2026-05-10 | BLOCKED | 세션: feature/0905-cycle1
**위반**: Claude Code가 작업 + 자기 "완료" 보고 → 17일 헛삽질 + cycle1 7시간 같은 패턴 반복 (DLL 가설, quota 200K 추정 등 자체 진단이 모두 어긋남)
**금지**:
- 작업한 AI가 동일 작업 검증
- "테스트 통과 = 사용자 만족" 단정
- 코드 변경 후 자가 시각 검증 없이 "완료" 선언
**대체**:
- 사이클 종료 시 독립 AI 검증 의무 (Gemini CLI Adversarial Review)
- 사용자 시각 점검 (브라우저/실데이터)
- 매 사이클 종료 docs/audit/YYYY-MM-DD-cycle[N]-review.md 보고서 생성
**검증**: 사이클 종료 시 `docs/audit/` 디렉토리에 독립 검증 보고서 존재 (없으면 사이클 미완료)

---

### #014: audit 보고서 미참조 plan 작성 (#013 운영 강화)
**등재**: 2026-05-10 | BLOCKED | 세션: feature/0905-cycle1 (audit 활성화)
**위반**: 새 cycle 시작 시 직전 사이클 `docs/audit/` review.md 미읽기 → audit이 휴지가 됨 = #013 위반 누적
**금지**:
- cycle plan 작성 시 직전 audit 미인용
- audit "잔여" / "이월" 항목 무시한 plan 작성
- audit 결과 모순되는 작업 우선순위
**대체**:
- cycle plan Phase 0 = 직전 `docs/audit/` 최신 review.md 자동 인용
- Plan 첫 줄에 audit URL/path 인용 의무
- master-tracker.md 업데이트가 매 사이클 종료 의무
**검증**: cycle plan 첫 줄에 `audited_against: docs/audit/YYYY-MM-DD-cycleN-...md` frontmatter 존재

---

### #007: VITE_ 접두사 오용 (비밀 키 브라우저 노출)
**등재**: 2026-04-22 | BLOCKED | 1회 | 세션: ffb5646
**위반**: `VITE_SUPABASE_SERVICE_KEY` — service_role 키가 빌드 산출물에 포함됨
**금지**:
- service_role 키에 VITE_ 접두사
- 백엔드 전용 API 키에 VITE_ 접두사
- "일단 VITE_ 붙이면 작동" 습관
**대체**:
- VITE_ = 공개 안전 항목만 (anon key, 공개 URL, 모델명)
- 비밀 키 = 접두사 없이, 백엔드 스크립트에서만 참조
- 배포 전 `dist/` 키 패턴 검색 필수
**검증**: `grep -rn "VITE_.*KEY\|VITE_.*SECRET\|VITE_.*TOKEN" .env` → 의심 항목 0건
