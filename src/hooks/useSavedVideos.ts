import { useState, useEffect } from 'react';
import { viralMockData } from '@/mocks/viralData';

const STORAGE_KEY = 'viralboard_saved_videos';
const SYNC_EVENT = 'viralboard_saved_videos_changed';

export interface SavedVideoItem {
  videoId: string;
  title: string;
  thumbnail: string;
  channelName: string;
}

const loadFromStorage = (): SavedVideoItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    return ids.map((id) => {
      const found = viralMockData.find((v) => v.videoId === id);
      return {
        videoId: id,
        title: found?.title ?? 'Saved Video',
        thumbnail: found?.thumbnail ?? `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
        channelName: found?.channelName ?? '',
      };
    });
  } catch {
    return [];
  }
};

export const useSavedVideos = () => {
  const [videos, setVideos] = useState<SavedVideoItem[]>(() => loadFromStorage());

  useEffect(() => {
    const handler = () => setVideos(loadFromStorage());
    window.addEventListener(SYNC_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(SYNC_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return { videos };
};
