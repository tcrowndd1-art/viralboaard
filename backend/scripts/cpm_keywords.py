"""
Track 2 — 고CPM 키워드 설정
(keyword, country, language, estimated_cpm_usd) 쌍
"""

# 8 niches × 2~3 keyword/country pairs
HIGH_CPM_KEYWORDS = {
    'finance': [
        ('주식 투자', 'KR', 'ko', 35),
        ('stock investing', 'US', 'en', 35),
        ('ETF 투자 방법', 'KR', 'ko', 30),
        ('personal finance', 'US', 'en', 28),
    ],
    'insurance': [
        ('보험 추천 2024', 'KR', 'ko', 40),
        ('life insurance explained', 'US', 'en', 45),
        ('자동차 보험 비교', 'KR', 'ko', 38),
    ],
    'real_estate': [
        ('부동산 투자 방법', 'KR', 'ko', 30),
        ('real estate investing', 'US', 'en', 35),
        ('不動産 投資 初心者', 'JP', 'ja', 22),
    ],
    'legal': [
        ('법률 상담 채널', 'KR', 'ko', 25),
        ('legal advice youtube', 'US', 'en', 40),
        ('弁護士 法律 相談', 'JP', 'ja', 20),
    ],
    'saas_tech': [
        ('SaaS 창업 전략', 'KR', 'ko', 20),
        ('software startup 2024', 'US', 'en', 25),
        ('no code app builder', 'US', 'en', 22),
    ],
    'medical': [
        ('건강 정보 채널', 'KR', 'ko', 20),
        ('doctor health tips', 'US', 'en', 22),
        ('医療 健康 情報', 'JP', 'ja', 16),
    ],
    'crypto': [
        ('비트코인 투자 전략', 'KR', 'ko', 25),
        ('bitcoin investing 2024', 'US', 'en', 30),
        ('暗号通貨 投資', 'JP', 'ja', 18),
    ],
    'education': [
        ('온라인 강의 추천', 'KR', 'ko', 18),
        ('online course review', 'US', 'en', 20),
        ('オンライン 学習', 'JP', 'ja', 14),
    ],
}

PER_KEYWORD = 5  # search.list maxResults per keyword (type=channel)
