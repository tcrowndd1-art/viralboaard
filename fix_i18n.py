# -*- coding: utf-8 -*-
"""
ViralBoard i18n 파일 완전 재작성
- en/ko/pt common.ts 전체를 UTF-8로 안전하게 작성
- BOM 없음, LF 줄바꿈
"""
from pathlib import Path

BASE = Path(r'C:\Ai_Wiki\viralboard\src\i18n\local')

# ─────────────────────────── 공통 키 정의 ───────────────────────────
# (key, en, ko, pt)
TRANSLATIONS = [
    # Brand
    ('brand', 'ViralBoard', 'ViralBoard', 'ViralBoard'),

    # Nav (사이드바)
    ('nav_home',             'Home',              '홈',                 'Início'),
    ('nav_video_rankings',   'Video Rankings',    '영상 랭킹',          'Rankings de Vídeos'),
    ('nav_rising',           'Rising',            '급상승',             'Em Alta'),
    ('nav_creator_insights', 'Creator Insights',  '크리에이터 인사이트', 'Insights de Criadores'),
    ('nav_channel_rankings', 'Channel Rankings',  '채널 랭킹',          'Rankings de Canais'),
    ('nav_search',           'Search',            '검색',               'Buscar'),
    ('nav_ai_studio',        'AI Studio',         'AI 스튜디오',        'AI Studio'),
    ('nav_video_editor',     'Video Editor',      '영상 편집기',        'Editor de Vídeo'),
    ('nav_my_dashboard',     'My Dashboard',      '내 대시보드',        'Meu Painel'),
    ('nav_comment_manager',  'Comment Manager',   '댓글 관리',          'Gerenciar Comentários'),
    ('nav_chrome_extension', 'Chrome Extension',  '크롬 확장',          'Extensão Chrome'),
    ('nav_charts',           'Charts',            '차트',               'Gráficos'),
    ('nav_insights',         'Insights',          '인사이트',           'Insights'),
    ('nav_trending_live',    'Trending Live',     '실시간 트렌딩',      'Tendências ao Vivo'),
    ('nav_revenue_calc',     'Revenue Calc',      '수익 계산기',        'Calculadora de Receita'),
    ('nav_more',             'MORE',              '더보기',             'MAIS'),
    ('nav_sign_in',          'Sign in',           '로그인',             'Entrar'),
    ('nav_sign_up',          'Sign up',           '회원가입',           'Cadastrar'),

    # Sidebar
    ('sidebar_favorite_channels',    'Favorite channels',     '즐겨찾기 채널',          'Canais favoritos'),
    ('sidebar_no_favorite_channels', 'No favorite channels.', '즐겨찾기 채널이 없습니다.', 'Nenhum canal favorito.'),
    ('sidebar_sign_in',              'Sign in',               '로그인',                 'Entrar'),
    ('sidebar_favorite_videos',      'Favorite videos',       '즐겨찾기 영상',          'Vídeos favoritos'),
    ('sidebar_no_favorite_videos',   'No favorite videos.',   '즐겨찾기 영상이 없습니다.', 'Nenhum vídeo favorito.'),
    ('sidebar_terms',                'Terms of Service',      '이용약관',               'Termos de Serviço'),
    ('sidebar_privacy',              'Privacy Policy',        '개인정보처리방침',       'Política de Privacidade'),
    ('sidebar_about',                'About ViralBoard',      'ViralBoard 소개',        'Sobre o ViralBoard'),
    ('dash_saved_channels_nav',      'Saved Channels',        '저장된 채널',            'Canais Salvos'),

    # Language
    ('lang_english',    'English',     'English',     'English'),
    ('lang_portuguese', 'Português',   'Português',   'Português'),
    ('lang_korean',     '한국어',      '한국어',      '한국어'),

    # Search
    ('search_placeholder',         'Search by channel/video link or keyword', '채널/영상 링크 또는 키워드로 검색', 'Buscar por canal/link de vídeo ou palavra-chave'),
    ('search_recent',              'Recent Searches',           '최근 검색',           'Buscas Recentes'),
    ('search_channel_placeholder', 'Search by channel name...', '채널 이름으로 검색...', 'Buscar por nome do canal...'),
    ('search_btn',                 'Search',                    '검색',                'Buscar'),

    # SearchBanner
    ('banner_title',  'Search and analyze',                       '검색하고 분석하세요',   'Pesquise e analise'),
    ('banner_title2', 'YouTube channels',                          'YouTube 채널을',        'canais do YouTube'),
    ('banner_title3', 'worldwide with professional filters.',      '전세계 전문 필터로.',   'em todo o mundo com filtros profissionais.'),
    ('banner_cta',    'Channel Search',                            '채널 검색',             'Buscar Canal'),

    # Footer
    ('footer_about',     'About ViralBoard',                       'ViralBoard 소개',         'Sobre o ViralBoard'),
    ('footer_terms',     'Terms of Service',                       '이용약관',                'Termos de Serviço'),
    ('footer_privacy',   'Privacy Policy',                         '개인정보처리방침',        'Política de Privacidade'),
    ('footer_copyright', '© 2026 DIFF., Inc. All Rights Reserved', '© 2026 DIFF., Inc. All Rights Reserved', '© 2026 DIFF., Inc. Todos os direitos reservados'),

    # Login
    ('login_title',         'Sign in to ViralBoard',                  'ViralBoard 로그인',                'Entrar no ViralBoard'),
    ('login_subtitle',      'Access your YouTube analytics dashboard', 'YouTube 분석 대시보드에 접속하세요', 'Acesse seu painel de análise do YouTube'),
    ('login_google',        'Continue with Google',                   'Google로 계속하기',                'Continuar com Google'),
    ('login_or',            'or sign in with email',                  '또는 이메일로 로그인',             'ou entre com e-mail'),
    ('login_email',         'Email address',                          '이메일 주소',                      'Endereço de e-mail'),
    ('login_password',      'Password',                               '비밀번호',                         'Senha'),
    ('login_forgot',        'Forgot password?',                       '비밀번호를 잊으셨나요?',           'Esqueceu a senha?'),
    ('login_submit',        'Sign in',                                '로그인',                           'Entrar'),
    ('login_submitting',    'Signing in...',                          '로그인 중...',                     'Entrando...'),
    ('login_no_account',    "Don't have an account?",                 '계정이 없으신가요?',               'Não tem uma conta?'),
    ('login_signup_link',   'Sign up',                                '회원가입',                         'Cadastre-se'),
    ('login_new_to',        'New to ViralBoard?',                     'ViralBoard가 처음이신가요?',       'Novo no ViralBoard?'),
    ('login_create',        'Create an account',                      '계정 만들기',                      'Criar uma conta'),
    ('login_error_fill',    'Please fill in all fields.',             '모든 필드를 입력해주세요.',        'Por favor, preencha todos os campos.'),
    ('login_error_email',   'Please enter a valid email address.',    '올바른 이메일 주소를 입력해주세요.', 'Por favor, insira um endereço de e-mail válido.'),

    # Signup
    ('signup_title',        'Create your account',                            '계정 만들기',                       'Criar sua conta'),
    ('signup_subtitle',     'Start analyzing YouTube channels for free',      '무료로 YouTube 채널 분석 시작하기', 'Comece a analisar canais do YouTube gratuitamente'),
    ('signup_google',       'Continue with Google',                           'Google로 계속하기',                'Continuar com Google'),
    ('signup_or',           'or sign up with email',                          '또는 이메일로 회원가입',           'ou cadastre-se com e-mail'),
    ('signup_email',        'Email address',                                  '이메일 주소',                      'Endereço de e-mail'),
    ('signup_password',     'Password',                                       '비밀번호',                         'Senha'),
    ('signup_confirm',      'Confirm password',                               '비밀번호 확인',                    'Confirmar senha'),
    ('signup_submit',       'Create account',                                 '계정 만들기',                      'Criar conta'),
    ('signup_submitting',   'Creating account...',                            '계정 생성 중...',                  'Criando conta...'),
    ('signup_have_account', 'Already have an account?',                       '이미 계정이 있으신가요?',          'Já tem uma conta?'),
    ('signup_signin_link',  'Sign in',                                        '로그인',                           'Entrar'),
    ('signup_terms_text',   'By creating an account, you agree to our',       '계정을 만들면 다음에 동의하게 됩니다', 'Ao criar uma conta, você concorda com nossos'),
    ('signup_terms',        'Terms of Service',                               '이용약관',                         'Termos de Serviço'),
    ('signup_and',          'and',                                            '및',                               'e'),
    ('signup_privacy',      'Privacy Policy',                                 '개인정보처리방침',                 'Política de Privacidade'),
    ('signup_error_fill',   'Please fill in all fields.',                     '모든 필드를 입력해주세요.',        'Por favor, preencha todos os campos.'),
    ('signup_error_email',  'Please enter a valid email address.',            '올바른 이메일 주소를 입력해주세요.', 'Por favor, insira um endereço de e-mail válido.'),
    ('signup_error_length', 'Password must be at least 8 characters.',        '비밀번호는 최소 8자 이상이어야 합니다.', 'A senha deve ter pelo menos 8 caracteres.'),
    ('signup_error_match',  'Passwords do not match.',                        '비밀번호가 일치하지 않습니다.',    'As senhas não coincidem.'),
    ('signup_strength',     'Password strength:',                             '비밀번호 강도:',                   'Força da senha:'),
    ('signup_weak',         'Weak',                                           '약함',                             'Fraca'),
    ('signup_fair',         'Fair',                                           '보통',                             'Regular'),
    ('signup_good',         'Good',                                           '좋음',                             'Boa'),
    ('signup_strong',       'Strong',                                         '강함',                             'Forte'),

    # Rankings
    ('rankings_title',           'Channel Rankings',                                                        '채널 랭킹',                                              'Rankings de Canais'),
    ('rankings_desc',            'Explore top YouTube channels worldwide by subscribers, views, and growth.', '구독자, 조회수, 성장률로 전세계 상위 YouTube 채널을 탐색하세요.', 'Explore os melhores canais do YouTube mundialmente por inscritos, visualizações e crescimento.'),
    ('rankings_channels',        'channels',     '채널',         'canais'),
    ('rankings_country',         'Country',      '국가',         'País'),
    ('rankings_category',        'Category',     '카테고리',     'Categoria'),
    ('rankings_period_daily',    'Daily',        '일간',         'Diário'),
    ('rankings_period_weekly',   'Weekly',       '주간',         'Semanal'),
    ('rankings_period_monthly',  'Monthly',      '월간',         'Mensal'),
    ('rankings_col_rank',        '#',            '#',            '#'),
    ('rankings_col_channel',     'Channel',      '채널',         'Canal'),
    ('rankings_col_category',    'Category',     '카테고리',     'Categoria'),
    ('rankings_col_country',     'Country',      '국가',         'País'),
    ('rankings_col_subscribers', 'Subscribers',  '구독자',       'Inscritos'),
    ('rankings_col_views',       'Views',        '조회수',       'Visualizações'),
    ('rankings_col_growth',      'Growth %',     '성장률 %',     'Crescimento %'),
    ('rankings_no_results',      'No channels found for the selected filters.', '선택한 필터에 맞는 채널이 없습니다.', 'Nenhum canal encontrado para os filtros selecionados.'),
    ('rankings_showing',         'Showing',      '표시 중',      'Mostrando'),
    ('rankings_of',              'of',           '/',            'de'),

    # Video Rankings
    ('video_rankings_title',         'Video Rankings',                                                        '영상 랭킹',                                       'Rankings de Vídeos'),
    ('video_rankings_desc',          'Top YouTube videos ranked by views, upload date, and engagement.',      '조회수, 업로드 날짜, 참여도로 상위 YouTube 영상 랭킹.', 'Melhores vídeos do YouTube classificados por visualizações, data de upload e engajamento.'),
    ('video_rankings_videos',        'videos',         '영상',          'vídeos'),
    ('video_rankings_col_thumbnail', 'Thumbnail',      '썸네일',        'Miniatura'),
    ('video_rankings_col_title',     'Video Title',    '영상 제목',     'Título do Vídeo'),
    ('video_rankings_col_channel',   'Channel',        '채널',          'Canal'),
    ('video_rankings_col_views',     'Views',          '조회수',        'Visualizações'),
    ('video_rankings_col_date',      'Upload Date',    '업로드 날짜',   'Data de Upload'),
    ('video_rankings_no_results',    'No videos found for the selected filters.', '선택한 필터에 맞는 영상이 없습니다.', 'Nenhum vídeo encontrado para os filtros selecionados.'),

    # Charts
    ('chart_most_super_chatted',  'Most Super Chatted',                                  '슈퍼챗 Top',                  'Mais Super Chats'),
    ('chart_most_live_viewers',   'Most Live Viewers',                                   '라이브 시청자 Top',           'Mais Espectadores ao Vivo'),
    ('chart_most_popular',        'Most Popular',                                        '인기 급상승',                 'Mais Popular'),
    ('chart_most_growth',         'Most Growth',                                         '성장률 Top',                  'Maior Crescimento'),
    ('chart_most_viewed',         'Most Viewed',                                         '조회수 Top',                  'Mais Visualizado'),
    ('chart_most_viewed_promo',   'Most Viewed Promotion',                               '홍보 조회수 Top',             'Promoção Mais Visualizada'),
    ('chart_topic_charts',        'Topic Charts',                                        '토픽 차트',                   'Gráficos por Tópico'),
    ('chart_topic_desc',          'Popular charts selected by channel topics classified by AI.', 'AI가 분류한 채널 토픽별 인기 차트.', 'Gráficos populares selecionados por tópicos de canais classificados por IA.'),
    ('chart_period_daily',        'Daily',  '일간', 'Diário'),
    ('chart_period_weekly',       'Weekly', '주간', 'Semanal'),

    # Trending Live
    ('trending_live_count',   'live streams',                  '라이브 방송',          'transmissões ao vivo'),
    ('trending_no_live',      'No live streams right now.',    '현재 라이브 방송이 없습니다.', 'Nenhuma transmissão ao vivo agora.'),
    ('trending_reset_filter', 'Reset filters',                 '필터 초기화',          'Redefinir filtros'),
    ('live_analyzing',        'Analyzing live...',             '라이브 분석 중...',    'Analisando ao vivo...'),

    # Search results
    ('search_results_for',    'Results for',                              '검색 결과',                'Resultados para'),
    ('search_found',          'Found',                                    '발견',                     'Encontrado'),
    ('search_channels_count', 'channels and',                             '개 채널 및',               'canais e'),
    ('search_videos_count',   'videos',                                   '개 영상',                  'vídeos'),
    ('search_explore_all',    'Explore All',                              '전체 보기',                'Explorar Tudo'),
    ('search_browse_all',     'Browse all channels and videos →',         '모든 채널과 영상 탐색 →',  'Navegar por todos os canais e vídeos →'),

    # Home sections
    ('home_rising_channels', 'Rising Channels',         '급상승 채널',         'Canais em Alta'),
    ('home_views_vs_subs',   'Views vs Subs',           '조회수 vs 구독자',    'Views vs Inscritos'),
    ('home_top_views',       'Top Views',               '조회수 Top',          'Top Visualizações'),
    ('home_est_revenue',     'Est. Revenue',            '예상 수익',           'Receita Estimada'),
    ('home_total_views_top', 'Total Views Top',         '누적 조회수 Top',     'Top Visualizações Totais'),
    ('home_shorts_1m',       'Shorts 1M',               'Shorts 1개월',        'Shorts 1M'),
    ('home_longform_3m',     'Longform 3M',             '롱폼 3개월',          'Longform 3M'),
    ('home_popular_channels','Popular Channels',        '인기 채널',           'Canais Populares'),
    ('home_by_subs',         'By Subscribers',          '구독자순',            'Por Inscritos'),
    ('home_by_views',        'By Views',                '조회수순',            'Por Visualizações'),
    ('home_view_all',        'View All',                '전체 보기',           'Ver Tudo'),
    ('home_viral_100',       'Viral ×100',              '바이럴 ×100',         'Viral ×100'),
    ('home_viral_30',        'Viral ×30',               '바이럴 ×30',          'Viral ×30'),
    ('home_viral_10',        'Viral ×10',               '바이럴 ×10',          'Viral ×10'),
    ('home_viral_score_order','Sorted by viral score',  '바이럴 점수순 정렬',  'Ordenado por pontuação viral'),
    ('home_trending_live',   'Trending Live',           '실시간 트렌딩',       'Tendências ao Vivo'),

    # Categories
    ('cat_all',           'All',           '전체',         'Todos'),
    ('cat_entertainment', 'Entertainment', '엔터테인먼트', 'Entretenimento'),
    ('cat_gaming',        'Gaming',        '게임',         'Jogos'),
    ('cat_music',         'Music',         '음악',         'Música'),
    ('cat_education',     'Education',     '교육',         'Educação'),
    ('cat_health',        'Health',        '건강',         'Saúde'),
    ('cat_sports',        'Sports',        '스포츠',       'Esportes'),
    ('cat_science',       'Science',       '과학',         'Ciência'),
    ('cat_psychology',    'Psychology',    '심리',         'Psicologia'),
    ('cat_selfdev',       'Self Dev',      '자기계발',     'Autodesenvolvimento'),
    ('cat_stories',       'Stories',       '스토리',       'Histórias'),
    ('cat_other',         'Other',         '기타',         'Outros'),

    # Trending common
    ('trending_count',   'videos',          '영상',          'vídeos'),
    ('trending_no_data', 'No trending data.','트렌딩 데이터가 없습니다.', 'Sem dados de tendências.'),
    ('trending_refresh', 'Refresh',         '새로고침',      'Atualizar'),

    # Time
    ('time_weeks_ago',  'weeks ago',  '주 전',  'semanas atrás'),
    ('time_days_ago',   'days ago',   '일 전',  'dias atrás'),
    ('time_hours_ago',  'hours ago',  '시간 전','horas atrás'),
    ('time_minutes_ago','minutes ago','분 전',  'minutos atrás'),
    ('time_just_now',   'just now',   '방금',   'agora mesmo'),

    # Rising page
    ('rising_title',       'Rising',                   '급상승',                'Em Alta'),
    ('rising_subtitle',    'Sorted by views per hour', '시간당 조회수 기준',     'Ordenado por views/hora'),
    ('rising_country_all', '🌍 All',                   '🌍 전체',               '🌍 Todos'),
    ('rising_type_all',    'All',                      '전체',                  'Todos'),
    ('rising_type_long',   '🎬 Longform',              '🎬 롱폼',               '🎬 Longform'),
    ('rising_type_shorts', '⚡ Shorts',                '⚡ Shorts',             '⚡ Shorts'),
    ('rising_no_data',     'No rising videos. Check back soon.', '급상승 영상이 없어요. 잠시 후 다시 확인해주세요.', 'Nenhum vídeo em alta. Volte em breve.'),
    ('rising_refresh',     'Refresh',                  '새로고침',              'Atualizar'),
]


def escape_js(s: str) -> str:
    """JS 문자열 이스케이프 (작은따옴표만)"""
    return s.replace('\\', '\\\\').replace("'", "\\'")


def build_translations(lang_idx: int) -> str:
    """lang_idx: 1=en, 2=ko, 3=pt"""
    lines = ['const translations = {']
    for row in TRANSLATIONS:
        key = row[0]
        val = row[lang_idx]
        lines.append(f"  {key}: '{escape_js(val)}',")
    lines.append('};')
    lines.append('export default translations;')
    lines.append('')  # 마지막 개행
    return '\n'.join(lines)


def write_file(path: Path, content: str):
    # UTF-8, BOM 없음, LF 줄바꿈
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print(f'  ✓ {path.name} ({len(content):,} bytes)')


def main():
    print('=' * 60)
    print('ViralBoard i18n 파일 재작성')
    print('=' * 60)

    en_path = BASE / 'en' / 'common.ts'
    ko_path = BASE / 'ko' / 'common.ts'
    pt_path = BASE / 'pt' / 'common.ts'

    print(f'\n경로: {BASE}')
    print(f'키 개수: {len(TRANSLATIONS)}')
    print()

    write_file(en_path, build_translations(1))
    write_file(ko_path, build_translations(2))
    write_file(pt_path, build_translations(3))

    print('\n✅ 완료. 브라우저 새로고침하세요.')


if __name__ == '__main__':
    main()