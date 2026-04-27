import { useState, useEffect, useCallback } from 'react';
import type { SavedChannel } from '@/mocks/userDashboard';

const STORAGE_KEY = 'viralboard_saved_channels';

// Custom event to sync across components
const SYNC_EVENT = 'viralboard_saved_channels_changed';

const dispatchSync = () => {
  window.dispatchEvent(new CustomEvent(SYNC_EVENT));
};

// Mock IDs seeded during early dev — strip them so they don't leak into production UI
const MOCK_IDS = new Set(['sc1', 'sc2', 'sc3', 'sc4', 'sc5']);

const loadFromStorage = (): SavedChannel[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SavedChannel[];
      const cleaned = parsed.filter((c) => !MOCK_IDS.has(c.id));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      return [...cleaned].sort((a, b) => (b.subscribers ?? 0) - (a.subscribers ?? 0) || a.name.localeCompare(b.name));
    }
  } catch {
    // ignore
  }
  return [];
};

const saveToStorage = (channels: SavedChannel[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
  dispatchSync();
};

export const useSavedChannels = () => {
  const [channels, setChannels] = useState<SavedChannel[]>(() => loadFromStorage());

  // Listen for cross-component sync
  useEffect(() => {
    const handler = () => {
      setChannels(loadFromStorage());
    };
    window.addEventListener(SYNC_EVENT, handler);
    return () => window.removeEventListener(SYNC_EVENT, handler);
  }, []);

  const addChannel = useCallback((channel: SavedChannel) => {
    setChannels((prev) => {
      if (prev.some((c) => c.id === channel.id)) return prev;
      const next = [channel, ...prev];
      saveToStorage(next);
      return next;
    });
  }, []);

  const removeChannel = useCallback((id: string) => {
    setChannels((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveToStorage(next);
      return next;
    });
  }, []);

  const toggleChannel = useCallback((channel: SavedChannel) => {
    setChannels((prev) => {
      const exists = prev.some((c) => c.id === channel.id);
      const next = exists
        ? prev.filter((c) => c.id !== channel.id)
        : [channel, ...prev];
      saveToStorage(next);
      return next;
    });
  }, []);

  const isSaved = useCallback(
    (id: string) => channels.some((c) => c.id === id),
    [channels]
  );

  return { channels, addChannel, removeChannel, toggleChannel, isSaved };
};
