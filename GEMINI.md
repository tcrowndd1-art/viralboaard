# ViralBoard — Gemini CLI 운영 규칙

## 절대 규칙 — 작업 제안 전 필수
사용자에게 "다음 작업 뭐할까요?" 묻기 전 반드시:
1. docs/BACKLOG.md 전체 읽기
2. 해당 항목 status 확인:
   - [ ] = open (아직 해야 함)
   - [x] = closed (이미 완료)
3. closed 항목을 open처럼 제안 시 = 시스템 위반
4. 불확실하면 사용자에게 "BACKLOG status 확인 먼저 할까요?" 질문

위반 사례 (2026-05-07 발생):
- AI가 "GitHub Secrets 5개 등록" 제안
- 실제로는 .env에 7개 키 이미 존재 + Secrets 일부 처리됨
- BACKLOG 미확인이 원인

방지: 작업 제안 → BACKLOG 인용 (해당 줄 번호 + 상태) → 사용자 컨펌

## rejected-patterns 동기화
- 마스터: c:\Ai_Wiki\.claude\learnings\rejected-patterns.md
- 복사본: viralboard/.claude/learnings/rejected-patterns.md
- 신규 패턴 등재 시: 마스터에 먼저, 그 다음 복사본 업데이트
- 마스터 변경 시: 1주일 내 복사본 동기화 (last_synced 갱신)

## 자동 검수 워크플로우 (Self-Review Loop)

### 트리거 (정정)
"커밋 컨펌 직전"에 자동 발동 (편집 1번마다 아님).
- 같은 파일 여러 번 수정 = 1번만 호출
- 사용자에게 "커밋할까요?" 묻기 직전 자동 실행

### 검수 항목 (3-Tier)

**Tier 1 — 보편 체크 (모든 src/, backend/scripts/ 제외):**
- 빈 catch 블록 (`catch {}` 또는 `catch (e) {}`)
- VITE_ 접두사로 secret 노출 (VITE_*_KEY, VITE_*_SECRET, VITE_*_TOKEN)
- 옵셔널 체이닝(?.) 누락 (data 접근 시)

**Tier 2 — 페이지 체크 (src/pages/**/*.tsx 수정 시):**
- dark:bg-dark-base 적용 여부
- max-w-7xl 적용 여부

**Tier 3 — 페이지별 특화 (해당 파일 수정 시만):**
- src/pages/rising/page.tsx → lg:ml-52 사이드바 오프셋

### 명령어 패턴
gemini --skip-trust -p "다음 파일 검수: [파일경로]
Tier 1: 빈 catch, VITE_ secret, 옵셔널 체이닝 누락
[Tier 2 적용 시: dark:bg-dark-base, max-w-7xl]
[Tier 3 적용 시: lg:ml-52]
결과 200자 이내. ✅ 통과 또는 ❌ [문제]"

### 응답 처리
- ✅ 통과 → 사용자에게 "커밋 OK?" 단답 질문
- ❌ 실패 → 자동 재수정 max 2회
  - 1차 재수정 → 재검수
  - 2차 재수정 → 재검수
  - 3차 실패 → 사용자 보고 + 작업 중단

### 절대 금지
- 무한 루프 (max retry 2 강제)
- gemini 응답 200자 초과 시 무시
- 사용자 컨펌 없이 자동 커밋
- 편집 1번마다 호출 (작업 단위 마감 시만)

### 적용 제외
- backend/scripts/ (cron 작업 영향)
- docs/ (마크다운, 검수 불필요)
- *.test.tsx, *.spec.ts (테스트 코드)

## 1순위 — 필수 참조
새 분석/작업 시작 전 반드시 `PROJECT_CONTEXT.md` 읽기 (스택, 경로, DB 스키마, cron 정보).

## 쓰기 제한 (최우선 규칙)
- `docs/analysis/` 하위 파일만 쓰기 허용
- `src/`, `backend/`, `scripts/` 직접 수정 절대 금지
- 모든 코드 변경 제안은 마크다운 문서로만 출력

## Templater 규칙
- "Trigger Templater on new file creation" 비활성화 유지 (자동 JS 실행 방지)
- Templater 수동 실행만 허용

## 분석 결과 저장 규칙
분석/감사/플랜 작업 후 `docs/analysis/YYYY-MM-DD-[주제].md` 자동 생성.
사용자에게 확인 요청 금지 — 바로 저장.

필수 frontmatter:
```yaml
---
date: YYYY-MM-DD
type: audit | review | exploration | insight | plan
target: [페이지/기능명]
priority: high | medium | low
status: open | resolved | archived
triggered_by: [사람 또는 insight ID]
triggered_action: [BACKLOG ID 또는 없음]
affected_code:
  - "[[src/pages/...]]"
related_insights:
  - "[[YYYY-MM-DD-관련-인사이트]]"
---
```

## 권장 호출 방식

**분석 전용 (read-only, 코드 수정 없음):**
```bash
node %APPDATA%/npm/node_modules/@google/gemini-cli/bundle/gemini.js --approval-mode plan -p "..."
```

**Adversarial Review (플랜 비판적 검토):**
```bash
node %APPDATA%/npm/node_modules/@google/gemini-cli/bundle/gemini.js --approval-mode plan -p "
플랜 비판적 검토:
@docs/analysis/YYYY-MM-DD-plan-[기능].md
@.claude/learnings/rejected-patterns.md

체크:
1. 설계 구조 문제 (캐싱, 동시성, 데이터 유실 위험)
2. 누락된 엣지케이스
3. rejected-patterns.md 위반 가능성
4. 더 단순한 대안 존재 여부

결과: 문제 목록만. 수정 금지. 치명적 문제 발견 시 명시.
"
```

**구현 후 코드 검수:**
```bash
node %APPDATA%/npm/node_modules/@google/gemini-cli/bundle/gemini.js -p "
수정 파일 검수: [파일 경로]
체크: ml-48 잔존, dark:bg-dark-base 미적용, max-w-7xl 누락, 옵셔널 체이닝 누락, 빈 catch 블록.
결과: OK 또는 FAIL [문제 목록]
"
```

## shim 복구 (PATH 문제 시)
```bash
npm install -g @google/gemini-cli
```
