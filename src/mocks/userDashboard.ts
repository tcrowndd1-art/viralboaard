export interface SavedChannel {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  category: string;
  subscribers: number;
  weeklyGrowth: number;
  isLive: boolean;
  lastVideo: string;
  lastVideoViews: number;
}

export interface RecentSearch {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
}

export interface TrendingAlert {
  id: string;
  type: 'growth_spike' | 'milestone' | 'viral_video' | 'live_peak';
  channelName: string;
  channelAvatar: string;
  message: string;
  value: string;
  timestamp: string;
  isNew: boolean;
}

export interface RecommendedChannel {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  category: string;
  subscribers: number;
  monthlyGrowth: number;
  reason: string;
}

export const savedChannels: SavedChannel[] = [
  {
    id: 'sc1',
    name: 'MrBeast',
    handle: '@MrBeast',
    avatar: 'https://readdy.ai/api/search-image?query=MrBeast%20YouTube%20creator%20portrait%20professional%20studio%20lighting%20bold%20colorful%20background&width=80&height=80&seq=ud_sc1&orientation=squarish',
    category: 'Entertainment',
    subscribers: 342000000,
    weeklyGrowth: 4.2,
    isLive: false,
    lastVideo: 'I Spent 50 Hours Buried Alive',
    lastVideoViews: 248000000,
  },
  {
    id: 'sc2',
    name: 'PewDiePie',
    handle: '@PewDiePie',
    avatar: 'https://readdy.ai/api/search-image?query=PewDiePie%20gaming%20YouTuber%20portrait%20casual%20studio%20background%20energetic%20expression&width=80&height=80&seq=ud_sc2&orientation=squarish',
    category: 'Gaming',
    subscribers: 111000000,
    weeklyGrowth: -0.3,
    isLive: true,
    lastVideo: 'GTA 6 Full Gameplay Reaction',
    lastVideoViews: 54000000,
  },
  {
    id: 'sc3',
    name: 'Marques Brownlee',
    handle: '@MKBHD',
    avatar: 'https://readdy.ai/api/search-image?query=tech%20reviewer%20YouTuber%20portrait%20professional%20studio%20dark%20background%20gadgets&width=80&height=80&seq=ud_sc3&orientation=squarish',
    category: 'Tech',
    subscribers: 19200000,
    weeklyGrowth: 1.1,
    isLive: false,
    lastVideo: 'iPhone 17 Pro Review: The Real Deal',
    lastVideoViews: 12400000,
  },
  {
    id: 'sc4',
    name: 'Linus Tech Tips',
    handle: '@LinusTechTips',
    avatar: 'https://readdy.ai/api/search-image?query=tech%20YouTube%20channel%20host%20portrait%20professional%20studio%20computer%20hardware%20background&width=80&height=80&seq=ud_sc4&orientation=squarish',
    category: 'Tech',
    subscribers: 16800000,
    weeklyGrowth: 0.7,
    isLive: false,
    lastVideo: 'We Built the World\'s Fastest PC',
    lastVideoViews: 8900000,
  },
  {
    id: 'sc5',
    name: 'Veritasium',
    handle: '@veritasium',
    avatar: 'https://readdy.ai/api/search-image?query=science%20education%20YouTuber%20portrait%20professional%20studio%20curious%20expression&width=80&height=80&seq=ud_sc5&orientation=squarish',
    category: 'Education',
    subscribers: 17600000,
    weeklyGrowth: 2.3,
    isLive: false,
    lastVideo: 'The Biggest Unsolved Problem in Physics',
    lastVideoViews: 21000000,
  },
  {
    id: 'sc6',
    name: 'Kurzgesagt',
    handle: '@kurzgesagt',
    avatar: 'https://readdy.ai/api/search-image?query=animated%20science%20education%20channel%20colorful%20bird%20mascot%20illustration%20bright%20background&width=80&height=80&seq=ud_sc6&orientation=squarish',
    category: 'Education',
    subscribers: 22400000,
    weeklyGrowth: 1.8,
    isLive: false,
    lastVideo: 'What If We Detonated All Nuclear Bombs at Once?',
    lastVideoViews: 34000000,
  },
];

export const recentSearches: RecentSearch[] = [
  { id: 'rs1', query: 'MrBeast gaming', timestamp: '2026-04-19T10:22:00Z', resultCount: 14 },
  { id: 'rs2', query: 'tech review channels 2026', timestamp: '2026-04-18T18:45:00Z', resultCount: 31 },
  { id: 'rs3', query: 'K-pop music YouTube', timestamp: '2026-04-18T14:10:00Z', resultCount: 22 },
  { id: 'rs4', query: 'fastest growing channels', timestamp: '2026-04-17T09:30:00Z', resultCount: 18 },
  { id: 'rs5', query: 'Minecraft speedrun', timestamp: '2026-04-16T21:05:00Z', resultCount: 9 },
];

export const trendingAlerts: TrendingAlert[] = [
  {
    id: 'ta1',
    type: 'viral_video',
    channelName: 'MrBeast',
    channelAvatar: 'https://readdy.ai/api/search-image?query=MrBeast%20YouTube%20creator%20portrait%20professional%20studio%20lighting%20bold%20colorful%20background&width=40&height=40&seq=ud_ta1&orientation=squarish',
    message: 'New video hit 50M views in 24 hours',
    value: '50M views',
    timestamp: '2026-04-19T08:00:00Z',
    isNew: true,
  },
  {
    id: 'ta2',
    type: 'growth_spike',
    channelName: 'Veritasium',
    channelAvatar: 'https://readdy.ai/api/search-image?query=science%20education%20YouTuber%20portrait%20professional%20studio%20curious%20expression&width=40&height=40&seq=ud_ta2&orientation=squarish',
    message: 'Subscriber growth spiked +12% this week',
    value: '+12% growth',
    timestamp: '2026-04-18T20:00:00Z',
    isNew: true,
  },
  {
    id: 'ta3',
    type: 'milestone',
    channelName: 'Kurzgesagt',
    channelAvatar: 'https://readdy.ai/api/search-image?query=animated%20science%20education%20channel%20colorful%20bird%20mascot%20illustration%20bright%20background&width=40&height=40&seq=ud_ta3&orientation=squarish',
    message: 'Reached 22M subscribers milestone',
    value: '22M subs',
    timestamp: '2026-04-18T12:00:00Z',
    isNew: false,
  },
  {
    id: 'ta4',
    type: 'live_peak',
    channelName: 'PewDiePie',
    channelAvatar: 'https://readdy.ai/api/search-image?query=PewDiePie%20gaming%20YouTuber%20portrait%20casual%20studio%20background%20energetic%20expression&width=40&height=40&seq=ud_ta4&orientation=squarish',
    message: 'Live stream peaked at 280K concurrent viewers',
    value: '280K live',
    timestamp: '2026-04-17T22:00:00Z',
    isNew: false,
  },
  {
    id: 'ta5',
    type: 'growth_spike',
    channelName: 'Marques Brownlee',
    channelAvatar: 'https://readdy.ai/api/search-image?query=tech%20reviewer%20YouTuber%20portrait%20professional%20studio%20dark%20background%20gadgets&width=40&height=40&seq=ud_ta5&orientation=squarish',
    message: 'iPhone 17 review video trending #1 in Tech',
    value: '#1 Trending',
    timestamp: '2026-04-17T15:00:00Z',
    isNew: false,
  },
];

export const recommendedChannels: RecommendedChannel[] = [
  {
    id: 'rc1',
    name: 'Wendover Productions',
    handle: '@Wendoverproductions',
    avatar: 'https://readdy.ai/api/search-image?query=documentary%20education%20YouTube%20channel%20professional%20studio%20globe%20travel%20infographic&width=80&height=80&seq=ud_rc1&orientation=squarish',
    category: 'Education',
    subscribers: 4800000,
    monthlyGrowth: 3.2,
    reason: 'Similar to Kurzgesagt you follow',
  },
  {
    id: 'rc2',
    name: 'Linus Tech Tips',
    handle: '@LinusTechTips',
    avatar: 'https://readdy.ai/api/search-image?query=tech%20YouTube%20channel%20host%20portrait%20professional%20studio%20computer%20hardware%20background&width=80&height=80&seq=ud_rc2&orientation=squarish',
    category: 'Tech',
    subscribers: 16800000,
    monthlyGrowth: 1.4,
    reason: 'Trending in Tech this week',
  },
  {
    id: 'rc3',
    name: 'Vsauce',
    handle: '@Vsauce',
    avatar: 'https://readdy.ai/api/search-image?query=science%20curiosity%20YouTube%20channel%20host%20portrait%20thoughtful%20expression%20studio%20background&width=80&height=80&seq=ud_rc3&orientation=squarish',
    category: 'Education',
    subscribers: 21000000,
    monthlyGrowth: 0.8,
    reason: 'Popular in Education category',
  },
  {
    id: 'rc4',
    name: 'Markiplier',
    handle: '@markiplier',
    avatar: 'https://readdy.ai/api/search-image?query=gaming%20YouTuber%20portrait%20expressive%20funny%20studio%20background%20colorful&width=80&height=80&seq=ud_rc4&orientation=squarish',
    category: 'Gaming',
    subscribers: 36000000,
    monthlyGrowth: 2.1,
    reason: 'Similar to PewDiePie you follow',
  },
];
