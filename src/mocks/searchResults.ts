export interface ChannelResult {
  id: string;
  type: 'channel';
  name: string;
  handle: string;
  avatar: string;
  category: string;
  country: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  growthPercent: number;
}

export interface VideoResult {
  id: string;
  type: 'video';
  title: string;
  channelName: string;
  channelAvatar: string;
  thumbnail: string;
  views: number;
  likes: number;
  duration: string;
  uploadDate: string;
  category: string;
}

export type SearchResult = ChannelResult | VideoResult;

export const mockChannelResults: ChannelResult[] = [
  {
    id: 'ch1',
    type: 'channel',
    name: 'MrBeast',
    handle: '@MrBeast',
    avatar: 'https://readdy.ai/api/search-image?query=MrBeast%20YouTube%20creator%20portrait%20professional%20studio%20lighting%20bold%20colorful%20background&width=80&height=80&seq=sr_ch1&orientation=squarish',
    category: 'Entertainment',
    country: 'US',
    subscribers: 342000000,
    totalViews: 48200000000,
    videoCount: 812,
    growthPercent: 4.2,
  },
  {
    id: 'ch2',
    type: 'channel',
    name: 'T-Series',
    handle: '@tseries',
    avatar: 'https://readdy.ai/api/search-image?query=T-Series%20Bollywood%20music%20label%20logo%20professional%20studio%20colorful%20Indian%20entertainment&width=80&height=80&seq=sr_ch2&orientation=squarish',
    category: 'Music',
    country: 'IN',
    subscribers: 278000000,
    totalViews: 240000000000,
    videoCount: 20400,
    growthPercent: 1.8,
  },
  {
    id: 'ch3',
    type: 'channel',
    name: 'PewDiePie',
    handle: '@PewDiePie',
    avatar: 'https://readdy.ai/api/search-image?query=PewDiePie%20gaming%20YouTuber%20portrait%20casual%20studio%20background%20energetic%20expression&width=80&height=80&seq=sr_ch3&orientation=squarish',
    category: 'Gaming',
    country: 'SE',
    subscribers: 111000000,
    totalViews: 29100000000,
    videoCount: 4600,
    growthPercent: -0.3,
  },
  {
    id: 'ch4',
    type: 'channel',
    name: 'Cocomelon',
    handle: '@Cocomelon',
    avatar: 'https://readdy.ai/api/search-image?query=Cocomelon%20kids%20nursery%20rhymes%20colorful%20cartoon%20watermelon%20character%20bright%20background&width=80&height=80&seq=sr_ch4&orientation=squarish',
    category: 'Education',
    country: 'US',
    subscribers: 178000000,
    totalViews: 175000000000,
    videoCount: 1020,
    growthPercent: 2.1,
  },
  {
    id: 'ch5',
    type: 'channel',
    name: 'SET India',
    handle: '@SETIndia',
    avatar: 'https://readdy.ai/api/search-image?query=SET%20India%20television%20network%20logo%20entertainment%20broadcast%20professional%20studio&width=80&height=80&seq=sr_ch5&orientation=squarish',
    category: 'Entertainment',
    country: 'IN',
    subscribers: 172000000,
    totalViews: 155000000000,
    videoCount: 98000,
    growthPercent: 0.9,
  },
  {
    id: 'ch6',
    type: 'channel',
    name: 'Vlad and Niki',
    handle: '@VladandNiki',
    avatar: 'https://readdy.ai/api/search-image?query=kids%20YouTube%20channel%20two%20children%20playing%20colorful%20toys%20bright%20cheerful%20background&width=80&height=80&seq=sr_ch6&orientation=squarish',
    category: 'Kids',
    country: 'US',
    subscribers: 116000000,
    totalViews: 82000000000,
    videoCount: 680,
    growthPercent: 3.4,
  },
];

export const mockVideoResults: VideoResult[] = [
  {
    id: 'v1',
    type: 'video',
    title: 'I Spent 50 Hours Buried Alive',
    channelName: 'MrBeast',
    channelAvatar: 'https://readdy.ai/api/search-image?query=MrBeast%20YouTube%20creator%20portrait%20professional%20studio%20lighting%20bold%20colorful%20background&width=40&height=40&seq=sr_va1&orientation=squarish',
    thumbnail: 'https://readdy.ai/api/search-image?query=person%20buried%20underground%20dramatic%20lighting%20survival%20challenge%20YouTube%20thumbnail%20bold%20text&width=320&height=180&seq=sr_v1&orientation=landscape',
    views: 248000000,
    likes: 9800000,
    duration: '21:34',
    uploadDate: '2026-03-15',
    category: 'Entertainment',
  },
  {
    id: 'v2',
    type: 'video',
    title: 'Minecraft, But Every Minute It Gets Harder',
    channelName: 'Dream',
    channelAvatar: 'https://readdy.ai/api/search-image?query=gaming%20YouTuber%20avatar%20mask%20mysterious%20dark%20background&width=40&height=40&seq=sr_va2&orientation=squarish',
    thumbnail: 'https://readdy.ai/api/search-image?query=Minecraft%20game%20screenshot%20dramatic%20challenge%20difficulty%20increasing%20blocks%20creeper&width=320&height=180&seq=sr_v2&orientation=landscape',
    views: 87000000,
    likes: 4200000,
    duration: '18:22',
    uploadDate: '2026-02-28',
    category: 'Gaming',
  },
  {
    id: 'v3',
    type: 'video',
    title: 'Tum Hi Ho - Official Music Video',
    channelName: 'T-Series',
    channelAvatar: 'https://readdy.ai/api/search-image?query=T-Series%20Bollywood%20music%20label%20logo%20professional%20studio%20colorful%20Indian%20entertainment&width=40&height=40&seq=sr_va3&orientation=squarish',
    thumbnail: 'https://readdy.ai/api/search-image?query=Bollywood%20romantic%20music%20video%20couple%20dramatic%20lighting%20Indian%20cinema%20cinematic&width=320&height=180&seq=sr_v3&orientation=landscape',
    views: 1420000000,
    likes: 18000000,
    duration: '4:22',
    uploadDate: '2013-04-13',
    category: 'Music',
  },
  {
    id: 'v4',
    type: 'video',
    title: 'World\'s Largest Lego Tower',
    channelName: 'MrBeast',
    channelAvatar: 'https://readdy.ai/api/search-image?query=MrBeast%20YouTube%20creator%20portrait%20professional%20studio%20lighting%20bold%20colorful%20background&width=40&height=40&seq=sr_va4&orientation=squarish',
    thumbnail: 'https://readdy.ai/api/search-image?query=giant%20Lego%20tower%20construction%20record%20breaking%20colorful%20blocks%20tall%20building%20challenge&width=320&height=180&seq=sr_v4&orientation=landscape',
    views: 192000000,
    likes: 7600000,
    duration: '14:08',
    uploadDate: '2026-01-20',
    category: 'Entertainment',
  },
  {
    id: 'v5',
    type: 'video',
    title: 'Learn Colors with Surprise Eggs',
    channelName: 'Cocomelon',
    channelAvatar: 'https://readdy.ai/api/search-image?query=Cocomelon%20kids%20nursery%20rhymes%20colorful%20cartoon%20watermelon%20character%20bright%20background&width=40&height=40&seq=sr_va5&orientation=squarish',
    thumbnail: 'https://readdy.ai/api/search-image?query=colorful%20surprise%20eggs%20kids%20learning%20colors%20cartoon%20animation%20bright%20cheerful&width=320&height=180&seq=sr_v5&orientation=landscape',
    views: 3800000000,
    likes: 22000000,
    duration: '32:14',
    uploadDate: '2021-06-10',
    category: 'Education',
  },
  {
    id: 'v6',
    type: 'video',
    title: 'GTA 6 - Full Gameplay Reveal Reaction',
    channelName: 'PewDiePie',
    channelAvatar: 'https://readdy.ai/api/search-image?query=PewDiePie%20gaming%20YouTuber%20portrait%20casual%20studio%20background%20energetic%20expression&width=40&height=40&seq=sr_va6&orientation=squarish',
    thumbnail: 'https://readdy.ai/api/search-image?query=GTA%206%20game%20reveal%20reaction%20gaming%20setup%20neon%20lights%20dramatic%20gaming%20room&width=320&height=180&seq=sr_v6&orientation=landscape',
    views: 54000000,
    likes: 2800000,
    duration: '28:47',
    uploadDate: '2026-04-01',
    category: 'Gaming',
  },
  {
    id: 'v7',
    type: 'video',
    title: 'Squid Game Season 3 - Official Trailer Reaction',
    channelName: 'Vlad and Niki',
    channelAvatar: 'https://readdy.ai/api/search-image?query=kids%20YouTube%20channel%20two%20children%20playing%20colorful%20toys%20bright%20cheerful%20background&width=40&height=40&seq=sr_va7&orientation=squarish',
    thumbnail: 'https://readdy.ai/api/search-image?query=Squid%20Game%20Netflix%20trailer%20reaction%20dramatic%20red%20green%20lighting%20Korean%20drama&width=320&height=180&seq=sr_v7&orientation=landscape',
    views: 31000000,
    likes: 1400000,
    duration: '12:55',
    uploadDate: '2026-03-28',
    category: 'Entertainment',
  },
  {
    id: 'v8',
    type: 'video',
    title: 'How to Master Python in 30 Days',
    channelName: 'TechWithTim',
    channelAvatar: 'https://readdy.ai/api/search-image?query=tech%20programming%20YouTuber%20portrait%20professional%20coding%20setup%20dark%20background&width=40&height=40&seq=sr_va8&orientation=squarish',
    thumbnail: 'https://readdy.ai/api/search-image?query=Python%20programming%20tutorial%20code%20screen%20dark%20background%20developer%20learning%20tech&width=320&height=180&seq=sr_v8&orientation=landscape',
    views: 18000000,
    likes: 920000,
    duration: '45:12',
    uploadDate: '2026-02-14',
    category: 'Education',
  },
];
