# ViralBoard AI 직원 팀 운영 매뉴얼

## 핵심 철학
저장 → 분석 → 개선안 도출 → 다음 세션에 적용
단순 저장이 아니라, 매일 쌓인 데이터가 다음 날 더 나은 결정을 만든다.

---

## AI 직원 역할표

| 직원 | 모델 | 담당 임무 |
|---|---|---|
| 개발실장 | Claude Sonnet 4.6 | 풀스택 개발, Claude Code 명령 실행 |
| 전략실장 | Claude Opus 4.7 | 아키텍처/BM/방향 결정 (복잡한 것만) |
| 영상분석관 | Gemini Flash | 컷 타임코드, 후킹 구간 추출 |
| SEO담당 | Claude Haiku | 클립별 제목/설명/태그 자동 생성 |
| 음성인식관 | Whisper 로컬 | STT, 대본 추출 (비용 0) |
| 더빙담당 | ElevenLabs | 다국어 TTS + Voice Cloning |
| 분석관 | Claude Sonnet 4.6 | 아래 "학습 임무" 전담 |

---

## 학습 임무 — 매일 자동 실행

### save_session.py 확장 임무
매일 23:00 save_session.py 실행 시 아래도 함께 수행:

**임무 1: DB 성장 추적**
- viralboard_data 건수 기록
- viral_title_archive 건수 기록
- 전날 대비 증감 계산
- docs/DAILY-{날짜}.md에 자동 기입

**임무 2: 이상 탐지**
- viralboard_data 건수가 전날보다 줄었으면 → 경고 출력
- viral_title_archive가 24시간 동안 증가 없으면 → 경고 출력
- fetch_phase1.py 마지막 실행 시각 확인 (1시간 이상 미실행 시 경고)

**임무 3: 주간 리포트 (매주 월요일 자동)**
- 지난 7일 DAILY 파일 읽어서 요약
- 완료된 작업 목록
- 반복된 이슈 패턴
- docs/WEEKLY-{날짜}.md로 저장 + 커밋

---

## 세션 시작 임무 — 매일 새 채팅 시작 시

새 채팅 첫 메시지 템플릿 (docs/START_SESSION.md에 저장):

```
ViralBoard 프로젝트 이어서 진행.

1. docs/PROJECT_STATUS_2026-05-05.md 읽기
2. docs/DAILY-어제날짜.md 읽기
3. 어제 "내일 이어서 할 것" 섹션 확인
4. 그 작업부터 바로 시작

추가 컨텍스트:
- fetch_phase1.py 터미널 실행 중 (닫지 말 것)
- Claude Code로 코딩 명령
- 전략 결정 필요 시 Opus 4.7로 전환 요청
```
