# ViralBoard — Gemini CLI 운영 규칙

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
