---
date: 2026-05-10
type: product
target: AI Studio Blueprint Appendix
---

# GP6: AI Studio 사전 청사진

### 1. 제작 파이프라인 (Flow)
- **Discovery:** ViralBoard 떡상 영상(VPH↑) 탐지.
- **Scripting:** AI(GPT-4o/Claude)를 통한 대본 리믹스 및 후킹 패턴 적용.
- **Speech:** TTS 엔진을 통한 고화질 음성 합성.
- **Assembly:** Remotion 기반 썸네일/자막/B-roll 자동 결합 및 렌더링.

### 2. 비즈니스 모델 및 결제 (BYOK $29)
- **Stripe:** 수수료 2.9%+$0.30로 저렴하나 글로벌 세금(VAT) 직접 관리 필요.
- **Lemon Squeezy (권장):** 수수료 5%+$0.50. **Merchant of Record(MoR)** 서비스로 전 세계 세금 신고/납부를 대행하여 1인 개발자의 운영 부담 최소화.

### 3. 플랫폼 아키텍처 (Web vs Desktop)
- **웹 앱 (React/Vite):** 설치 불필요, 업데이트 용이, 접근성 최대. (권장)
- **데스크톱 (Tauri/Electron):** 로컬 리소스(FFmpeg) 활용 유리하나 배포/업데이트 복잡도 상승.

### 4. 핵심 API 및 라이브러리 비교
- **TTS:** **OpenAI TTS**(가성비 $15/1M) vs **ElevenLabs**(최고 화질 $180/1M) -> 기본 OpenAI, 프리미엄 ElevenLabs 옵션 제공 권장.
- **편집/렌더링:** **Remotion**(React 기반, 프레임 정확도) vs **Shotstack**(클라우드 API, $0.20/분) -> 커스텀 자유도가 높은 'Remotion' 권장.
- **FFmpeg:** 대량 트랜스코딩용 백엔드 보조 엔진으로 활용.

**Gate 1(100명) 도달 후 60일 이내 v1.0 런칭 목표.**
