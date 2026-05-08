export type Cat =
  | 'All'
  | 'Entertainment'
  | 'Gaming'
  | 'Music'
  | 'Sports'
  | 'Science'
  | 'Psychology'
  | 'Self-Dev'
  | 'Other';

export const CATS: Cat[] = [
  'All', 'Entertainment', 'Gaming', 'Music', 'Sports', 'Science', 'Psychology', 'Self-Dev', 'Other',
];

// DB value → display name (what normalizeCategory returns)
export const DB_CAT_MAP: Record<string, string> = {
  // Post-migration lowercase_underscore values
  entertainment: 'Entertainment',
  gaming: 'Gaming',
  music: 'Music',
  sports: 'Sports',
  science: 'Science',
  psychology: 'Psychology',
  self_dev: 'Self-Dev',
  // YouTube API category slugs
  science_tech: 'Science',
  howto_style: 'Self-Dev',
  comedy: 'Entertainment',
  film_animation: 'Entertainment',
  news_politics: 'Other',
  people_blogs: 'Other',
  reference: 'Other',
  autos_vehicles: 'Other',
  pets_animals: 'Other',
  // Pre-migration hyphen form (fallback)
  'self-dev': 'Self-Dev',
  education: 'Other',
  health: 'Other',
  stories: 'Other',
  other: 'Other',
};

// Display name → display names produced by normalizeCategory (for filter matching)
export const CAT_MAP: Record<Cat, string[]> = {
  'All': [],
  'Entertainment': ['Entertainment'],
  'Gaming': ['Gaming'],
  'Music': ['Music'],
  'Sports': ['Sports'],
  'Science': ['Science'],
  'Psychology': ['Psychology'],
  'Self-Dev': ['Self-Dev'],
  'Other': ['Other'],
};

export const normalizeCategory = (c: string | null | undefined): string => {
  const cat = c?.toLowerCase() ?? '';
  if (DB_CAT_MAP[cat]) return DB_CAT_MAP[cat];
  if (cat.startsWith('niche_')) return 'Other';
  return c ?? 'Other';
};

// 한글 카테고리 라벨 → viral_title_archive DB 카테고리 키
export const KOR_TO_DB: Record<string, string> = {
  '먹방': 'people_blogs',
  '반려동물': 'pets_animals',
  '음악·댄스': 'music',
  '게임': 'gaming',
  '건강': 'howto_style',
  '요리레시피': 'howto_style',
  '예능': 'entertainment',
  '뉴스': 'news_politics',
  '스포츠': 'sports',
  '과학': 'science_tech',
};

export const VISIBLE_CATEGORIES = CATS;
export const ENABLE_NICHE = false;
