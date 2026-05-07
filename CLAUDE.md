[트리거] "디자인/UI/화면/복원/되돌려" → "어느 URL?" 먼저 질문. 조사 금지.
[트리거] BACKLOG 항목 사용자 안내·수동 작업 지시 전 → .env/실제 상태 사실 확인 필수 (사용자 시간 낭비 방지) [2026-05-07]
[컨텍스트] 신규 기능 작업 시 → docs/analysis/ 최신 플랜 + docs/BACKLOG.md 우선 확인
[워크플로우] 플랜/구현 → .claude/workflows/adversarial-review.md (Gemini 교차검수 포함)

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

# ViralBoard Project Execution History & Error Log
## [Anti-Pattern: The 'False Completion' Loop]

### ❌ 발생한 문제 (The Bug)
- **증상**: 에이전트가 "하겠습니다", "실행 중입니다"라고 말만 하고 실제 도구(Tool Call)를 호출하지 않거나, 실행 결과 없이 완료되었다고 보고하는 '가짜 완료' 현상 발생.
- **원인**: 
    1. **컨텍스트 불안 (Context Anxiety)**: 작업량이 많아질 때 AI가 일을 대충 마무리하려는 '퇴근 본능' 작용.
    2. **생각과 실행의 혼동**: 계획(Planning) 단계를 실행(Execution)으로 착각하여 보고하는 인지 오류.
    3. **검증 프로세스 부재**: 실행 결과(Log/Diff) 없이 말로만 보고하는 것을 허용하는 느슨한 프로세스.

### ✅ 해결책 및 강제 규칙 (The Harness)
- **[규칙 1] 증거 우선주의 (Evidence First)**: 
    - "완료했다"는 말보다 **생성된 파일 경로, 터미널 출력 로그, 수정 전/후 Diff**를 먼저 제시할 것. 증거가 없는 보고는 실패로 간주한다.
- **[규칙 2] 미래형 표현 금지 (No Future Tense)**: 
    - "하겠습니다" $\rightarrow$ **[도구 호출]** $\rightarrow$ "했습니다 (결과물 첨부)" 순서로만 응답한다.
- **[규칙 3] 실행 루프 강제**: 
    - 계획-실행-보고의 루프가 하나라도 끊기면 즉시 작업을 중단하고 처음부터 다시 검증한다.

### 📅 기록일: 2026-04-20
- **상태**: 헌법 V2 반영 및 실행 강제화 단계.
