export interface TrendingVideo {
  id: number;
  video_id: string;
  category: string;
  country: string;
  title: string;
  channel: string;
  channel_id: string;
  views: number;
  likes: number;
  comments: number;
  duration_seconds: number;
  is_shorts: boolean;
  thumbnail_url: string;
  reference_channel: boolean;
  style_tag: string | null;
  actual_width: number | null;
  actual_height: number | null;
  fetched_at: string;
}

export type CategoryFilter = 'all' | 'people_blogs' | 'entertainment' | 'news_politics' | 'howto_style' | 'science_tech' | 'reference';
export type ShortsFilter = 'all' | 'shorts' | 'longform';
export type SortOrder = 'views' | 'recent';
