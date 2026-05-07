# docs/analysis — 분석 결과 저장소

Gemini CLI 분석, Claude 플랜, 감사 결과를 저장합니다.
AI 에이전트와 옵시디언 모두에서 읽을 수 있는 plain-text 기반.

## 명명 규칙

```
YYYY-MM-DD-[주제-슬러그].md

예시:
  2026-05-07-plan-rising-filter.md   ← 구현 전 플랜
  2026-05-07-review-rising-filter.md ← 구현 후 검수
  2026-05-06-page-audit.md           ← 전체 감사
  2026-05-06-bounce-rate-spike.md    ← 인사이트
```

## frontmatter 표준

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
  - "[[src/pages/rising/page.tsx]]"
related_insights:
  - "[[2026-05-06-관련-인사이트]]"
---
```

### 필드 설명

| 필드 | 값 | 설명 |
|------|----|------|
| `type: plan` | 구현 전 | Gemini Adversarial Review 대상 |
| `type: review` | 구현 후 | Gemini Code Review 결과 |
| `type: audit` | 전체 점검 | 프로젝트 전반 감사 |
| `type: insight` | 데이터 기반 | Supabase/vidIQ 분석 결과 |
| `status: open` | 미해결 | BACKLOG.md 에 자동 반영 |
| `status: resolved` | 완료 | 커밋 후 업데이트 |
| `affected_code` | 코드 링크 | 옵시디언 vault 확장 시 정상 링크 |

## 옵시디언 호환

`[[링크]]` 형식은 현재 vault 루트 (`docs/`) 기준 상대 경로.
`affected_code` 의 코드 파일 링크는 vault 확장(Phase 1.5) 후 정상 작동.
현재는 텍스트 참조로 동작 — AI 에이전트 읽기는 정상.
