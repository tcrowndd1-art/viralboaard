"""
Track 4 — 니치 키워드 설정
(keyword, country) 쌍으로 search.list 호출
"""

# 20 niches × 2~3 keyword/country pairs
NICHE_KEYWORDS = {
    'cooking':      [('cooking recipe', 'US'), ('요리 레시피', 'KR'), ('料理 レシピ', 'JP')],
    'mukbang':      [('mukbang', 'US'), ('먹방', 'KR'), ('먹방 ASMR', 'KR')],
    'asmr':         [('asmr', 'US'), ('ASMR', 'JP'), ('asmr eating', 'US')],
    'fitness':      [('workout at home', 'US'), ('홈트레이닝', 'KR'), ('筋トレ', 'JP')],
    'finance':      [('stock investing tips', 'US'), ('주식 투자', 'KR'), ('株式投資', 'JP')],
    'crypto':       [('crypto trading 2024', 'US'), ('비트코인', 'KR'), ('crypto news', 'US')],
    'travel':       [('travel vlog', 'US'), ('여행 브이로그', 'KR'), ('旅行 vlog', 'JP')],
    'beauty':       [('makeup tutorial', 'US'), ('메이크업 튜토리얼', 'KR'), ('メイク チュートリアル', 'JP')],
    'gaming':       [('gaming highlights 2024', 'US'), ('게임 하이라이트', 'KR'), ('ゲーム実況', 'JP')],
    'study_vlog':   [('study with me', 'US'), ('공부 브이로그', 'KR'), ('勉強 vlog', 'JP')],
    'language':     [('learn english', 'KR'), ('일본어 배우기', 'KR'), ('learn korean', 'US')],
    'pet':          [('cute dog video', 'US'), ('강아지 일상', 'KR'), ('猫 かわいい', 'JP')],
    'real_estate':  [('real estate investing', 'US'), ('부동산 투자', 'KR'), ('不動産 投資', 'JP')],
    'entrepreneur': [('entrepreneur mindset', 'US'), ('창업 이야기', 'KR')],
    'ai_tech':      [('artificial intelligence 2024', 'US'), ('AI 활용법', 'KR'), ('ChatGPT 使い方', 'JP')],
    'productivity': [('productivity tips', 'US'), ('생산성 향상', 'KR'), ('時間管理 術', 'JP')],
    'motivation':   [('motivational speech', 'US'), ('동기부여 영상', 'KR'), ('モチベーション', 'JP')],
    'shorts_viral': [('viral shorts', 'US'), ('쇼츠 바이럴', 'KR'), ('バズった', 'JP')],
    'unboxing':     [('unboxing 2024', 'US'), ('언박싱', 'KR'), ('開封動画', 'JP')],
    'fashion':      [('fashion lookbook', 'US'), ('패션 룩북', 'KR'), ('ファッション コーデ', 'JP')],
}

PER_KEYWORD = 5  # search.list maxResults per (keyword, country)
