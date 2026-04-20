export interface InsightPost {
  id: string;
  slug: string;
  category: 'ranking' | 'analysis' | 'trend' | 'report' | 'data';
  categoryLabel: string;
  title: string;
  description: string;
  thumbnail: string;
  date: string;
  readTime: string;
  featured: boolean;
  tags: string[];
}

export const insightPosts: InsightPost[] = [
  {
    id: '1',
    slug: 'super-chat-ranking-2022',
    category: 'ranking',
    categoryLabel: 'Ranking',
    title: '2022 Super Chat Ranking (~12.09)',
    description: '2022년 1월 1일부터 12월 9일까지 슈퍼챗으로 가장 많은 수익을 얻은 유튜브 채널의 타임랩스 랭킹 차트를 확인해보세요.',
    thumbnail: 'https://readdy.ai/api/search-image?query=YouTube%20super%20chat%20ranking%20bar%20chart%20race%20animation%20dark%20background%20red%20green%20neon%20colors%20data%20visualization%202022%20top%20earners%20streaming&width=640&height=360&seq=insight1&orientation=landscape',
    date: '2022.12.12',
    readTime: '3 min read',
    featured: true,
    tags: ['Super Chat', 'Ranking', '2022'],
  },
  {
    id: '2',
    slug: 'playboard-distribution-analysis',
    category: 'analysis',
    categoryLabel: 'Analysis',
    title: '어떤 채널들이 플레이버튼을 받았을까?',
    description: '플레이버튼을 받은 채널의 국가/카테고리 분포를 분석한 데이터를 확인해보세요.',
    thumbnail: 'https://readdy.ai/api/search-image?query=world%20map%20bubble%20chart%20data%20visualization%20countries%20distribution%20YouTube%20play%20button%20awards%20green%20teal%20colorful%20circles%20analytics&width=640&height=360&seq=insight2&orientation=landscape',
    date: '2020.04.01',
    readTime: '5 min read',
    featured: true,
    tags: ['Play Button', 'Distribution', 'Global'],
  },
  {
    id: '3',
    slug: 'youtube-shorts-growth-2023',
    category: 'trend',
    categoryLabel: 'Trend',
    title: 'YouTube Shorts 채널 성장 트렌드 2023',
    description: 'Shorts 콘텐츠를 주력으로 하는 채널들의 구독자 성장 속도가 일반 채널 대비 얼마나 빠른지 분석했습니다.',
    thumbnail: 'https://readdy.ai/api/search-image?query=YouTube%20Shorts%20vertical%20video%20growth%20trend%20chart%20upward%20arrow%20statistics%20analytics%20modern%20dark%20background%20gradient&width=640&height=360&seq=insight3&orientation=landscape',
    date: '2023.06.15',
    readTime: '4 min read',
    featured: false,
    tags: ['Shorts', 'Growth', '2023'],
  },
  {
    id: '4',
    slug: 'kpop-global-reach-analysis',
    category: 'analysis',
    categoryLabel: 'Analysis',
    title: 'K-POP 채널의 글로벌 도달 범위 분석',
    description: '한국 K-POP 채널들이 전 세계 어느 국가에서 가장 많이 시청되는지, 구독자 분포와 조회수 패턴을 심층 분석합니다.',
    thumbnail: 'https://readdy.ai/api/search-image?query=K-pop%20music%20YouTube%20analytics%20global%20reach%20world%20map%20colorful%20data%20visualization%20South%20Korea%20hallyu%20wave%20statistics%20chart&width=640&height=360&seq=insight4&orientation=landscape',
    date: '2023.03.22',
    readTime: '6 min read',
    featured: false,
    tags: ['K-POP', 'Global', 'Korea'],
  },
  {
    id: '5',
    slug: 'live-streaming-peak-hours',
    category: 'data',
    categoryLabel: 'Data',
    title: '라이브 스트리밍 피크 시간대 데이터 리포트',
    description: '전 세계 유튜브 라이브 스트리밍의 시간대별 시청자 수 패턴을 분석하여 최적의 방송 시간을 제안합니다.',
    thumbnail: 'https://readdy.ai/api/search-image?query=live%20streaming%20peak%20hours%20heatmap%20time%20zone%20data%20chart%20analytics%20purple%20orange%20gradient%20dark%20background%20viewers%20count&width=640&height=360&seq=insight5&orientation=landscape',
    date: '2023.09.10',
    readTime: '5 min read',
    featured: false,
    tags: ['Live', 'Streaming', 'Analytics'],
  },
  {
    id: '6',
    slug: 'gaming-channel-monetization',
    category: 'report',
    categoryLabel: 'Report',
    title: '게이밍 채널 수익화 전략 리포트 2023',
    description: '상위 100개 게이밍 채널의 슈퍼챗, 멤버십, 광고 수익 비율을 분석하고 효과적인 수익화 전략을 도출했습니다.',
    thumbnail: 'https://readdy.ai/api/search-image?query=gaming%20YouTube%20channel%20monetization%20revenue%20chart%20bar%20graph%20neon%20colors%20dark%20background%20esports%20streaming%20income%20analytics%20report&width=640&height=360&seq=insight6&orientation=landscape',
    date: '2023.11.05',
    readTime: '7 min read',
    featured: false,
    tags: ['Gaming', 'Monetization', 'Revenue'],
  },
  {
    id: '7',
    slug: 'vtuber-market-growth',
    category: 'trend',
    categoryLabel: 'Trend',
    title: 'VTuber 시장 성장 분석: 2020-2023',
    description: 'VTuber 채널의 급격한 성장세와 주요 사무소별 구독자 현황, 슈퍼챗 수익 분포를 종합적으로 분석합니다.',
    thumbnail: 'https://readdy.ai/api/search-image?query=VTuber%20virtual%20YouTuber%20anime%20avatar%20growth%20chart%20statistics%20colorful%20data%20visualization%20Japan%20streaming%20market%202023&width=640&height=360&seq=insight7&orientation=landscape',
    date: '2023.08.20',
    readTime: '8 min read',
    featured: false,
    tags: ['VTuber', 'Virtual', 'Japan'],
  },
  {
    id: '8',
    slug: 'subscriber-milestone-speed',
    category: 'data',
    categoryLabel: 'Data',
    title: '구독자 마일스톤 달성 속도 비교',
    description: '100만, 1000만 구독자를 가장 빠르게 달성한 채널들의 성장 곡선을 비교 분석합니다.',
    thumbnail: 'https://readdy.ai/api/search-image?query=YouTube%20subscriber%20milestone%20speed%20comparison%20line%20chart%20growth%20curve%20analytics%20data%20visualization%20gold%20silver%20trophy%20achievement&width=640&height=360&seq=insight8&orientation=landscape',
    date: '2023.07.14',
    readTime: '4 min read',
    featured: false,
    tags: ['Milestone', 'Subscribers', 'Speed'],
  },
  {
    id: '9',
    slug: 'category-view-distribution-2023',
    category: 'report',
    categoryLabel: 'Report',
    title: '카테고리별 조회수 분포 연간 리포트',
    description: '2023년 유튜브 전체 카테고리별 조회수 점유율 변화와 성장/하락 카테고리를 한눈에 파악하세요.',
    thumbnail: 'https://readdy.ai/api/search-image?query=YouTube%20category%20views%20distribution%20pie%20chart%20donut%20chart%20annual%20report%202023%20colorful%20segments%20entertainment%20music%20gaming%20education&width=640&height=360&seq=insight9&orientation=landscape',
    date: '2023.12.28',
    readTime: '6 min read',
    featured: false,
    tags: ['Category', 'Views', 'Annual'],
  },
];

export const insightCategories = [
  { value: 'all', label: 'All' },
  { value: 'ranking', label: 'Ranking' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'trend', label: 'Trend' },
  { value: 'report', label: 'Report' },
  { value: 'data', label: 'Data' },
];
