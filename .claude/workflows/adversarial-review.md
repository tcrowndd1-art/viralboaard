# Adversarial Review 워크플로우

구현 전 플랜 검토 + 구현 후 코드 검수.
Gemini CLI 를 교차 검수자로 활용. max retry 2회.

---

## 전체 흐름 (8단계)

```
1. Claude.ai (이 채팅)
   → 기능 설계 결정

2. Claude Code (Opus 최신)
   → 플랜 마크다운 작성
   → docs/analysis/YYYY-MM-DD-plan-[기능].md 저장
   → frontmatter: type: plan, status: open

3. Gemini CLI — Adversarial Review (플랜 비판)
   → --approval-mode plan (read-only, 코드 수정 없음)
   → 문제 목록만 출력. 수정 금지.
   → 치명적 문제 발견 시 → Step 1 에스컬레이션

4. David 검토
   → 반영 여부 결정
   → Claude Code 플랜 수정

5. Claude Code (Sonnet 최신)
   → 실제 구현

6. Gemini CLI — Code Review (구현 검수)
   → max retry 2회
   → 2회 후 여전히 FAIL → David 에스컬레이션

7. Claude Code
   → PASS 시 커밋 + push

8. docs/analysis/ 업데이트
   → status: resolved
```

---

## Gemini 호출 명령

### Step 3: Adversarial Review (플랜 검토)

```bash
node %APPDATA%/npm/node_modules/@google/gemini-cli/bundle/gemini.js ^
  --approval-mode plan ^
  -p "플랜 비판적 검토:
@docs/analysis/YYYY-MM-DD-plan-[기능].md
@.claude/learnings/rejected-patterns.md

체크:
1. 설계 구조 문제 (캐싱, 동시성, 데이터 유실 위험)
2. 누락된 엣지케이스
3. ViralBoard rejected-patterns.md 위반 가능성
4. 더 단순한 대안 존재 여부

결과: 문제 목록만. 수정 금지.
치명적 문제(구조 전면 재설계 필요) 발견 시 CRITICAL 명시."
```

### Step 6: Code Review (구현 검수)

```bash
node %APPDATA%/npm/node_modules/@google/gemini-cli/bundle/gemini.js ^
  -p "수정 파일 검수:
@[수정한 파일 경로]

체크:
- ml-48 잔존 여부
- dark:bg-dark-base 미적용
- max-w-7xl 누락
- 옵셔널 체이닝 누락
- 빈 catch 블록
- rejected-patterns.md 위반

결과: PASS 또는 FAIL [문제 목록]"
```

---

## 에스컬레이션 규칙

| 상황 | 대응 |
|------|------|
| Adversarial Review → CRITICAL | Claude.ai 재설계 (Step 1 재진입) |
| Code Review retry 2회 모두 FAIL | David 직접 검토 |
| 두 모델 의견 불일치 | David 중재 |

---

## shim 복구 (gemini 명령어 안 될 때)

```bash
npm install -g @google/gemini-cli
# 이후 gemini --version 으로 확인
```
