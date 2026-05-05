# ViralBoard AI 직원 팀 (1인 기업 운영)

## 역할 분담

### Claude (Sonnet 4.6) — 개발 실무
- 역할: 풀스택 개발, Claude Code 명령 실행
- 담당: 프론트엔드/백엔드 코드 작성, 버그 수정, 기능 추가
- 사용법: Claude Code에 명령 붙여넣기

### Claude (Opus 4.7) — 전략/기획
- 역할: 아키텍처 결정, BM 전략, 중요 분기점 판단
- 담당: AI Studio 기획, 가격 정책, 기술 방향 결정
- 사용법: 복잡한 결정 전 "Opus 필요" 신호 후 전환

### Gemini Flash — 영상 분석 (AI Studio 내부)
- 역할: 컷 타임코드 추출, 후킹 구간 분석
- 담당: 텍스트 기반 영상 분석 (비용 최소화)

### Claude Haiku — SEO 자동화 (AI Studio 내부)
- 역할: 클립별 제목/설명/태그 자동 생성
- 담당: 빠르고 저렴한 텍스트 생성

### Whisper (로컬) — 음성 인식
- 역할: STT (Speech-to-Text)
- 담당: 영상 대본 추출, 로컬 처리 (API 비용 0)

### ElevenLabs — 다국어 더빙
- 역할: TTS + Voice Cloning
- 담당: 다국어 더빙 생성 (크레딧 차감)

## 운영 규칙
1. 코딩 = Claude Code (Sonnet)
2. 전략 결정 = Opus 4.7 (복잡한 것만)
3. 영상 분석 = Gemini Flash (비용 80% 절감)
4. SEO = Claude Haiku (빠르고 저렴)
5. 더빙 = ElevenLabs (크레딧 관리)

## 세션 운영 방법
1. 세션 시작: PROJECT_STATUS 최신 파일 읽고 시작
2. 세션 진행: Claude Code로 개발, 이 채팅으로 전략
3. 세션 종료: save_session.py 자동 실행 (매일 11PM)
4. 주간 정리: Knowledge 파일 업데이트 (매주 월요일)
