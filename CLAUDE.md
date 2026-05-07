[트리거] "디자인/UI/화면/복원/되돌려" → "어느 URL?" 먼저 질문. 조사 금지.
[컨텍스트] 신규 기능 작업 시 → docs/analysis/ 최신 플랜 + docs/BACKLOG.md 우선 확인
[워크플로우] 플랜/구현 → .claude/workflows/adversarial-review.md (Gemini 교차검수 포함)

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
