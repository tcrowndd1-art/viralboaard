import { Page } from '@playwright/test';

function makeVideoItems(count: number, startId = 1) {
  return Array.from({ length: count }, (_, i) => ({
    id: `vid${startId + i}`,
    snippet: {
      title: `Test Video ${startId + i}`,
      channelId: `ch${(i % 5) + 1}`,
      channelTitle: `Test Channel ${(i % 5) + 1}`,
      publishedAt: '2026-01-15T00:00:00Z',
      categoryId: '10',
      thumbnails: { default: { url: '' }, medium: { url: '' } },
    },
    statistics: {
      viewCount: String(5000000 - i * 50000),
      likeCount: '100000',
    },
    contentDetails: { duration: 'PT5M30S' },
  }));
}

function makeChannelItems(ids: string[]) {
  return ids.map((id, i) => ({
    id,
    snippet: {
      title: `Test Channel ${i + 1}`,
      customUrl: `@testchannel${i + 1}`,
      description: 'Test description',
      country: 'KR',
      thumbnails: { default: { url: '' }, high: { url: '' } },
    },
    statistics: {
      subscriberCount: String(5000000 - i * 200000),
      viewCount: String(200000000),
      videoCount: '500',
    },
    brandingSettings: { image: {} },
    topicDetails: {
      topicCategories: ['https://en.wikipedia.org/wiki/Music'],
    },
  }));
}

export async function mockYouTubeApi(page: Page): Promise<void> {
  await page.route('https://www.googleapis.com/youtube/v3/**', async (route) => {
    const url = new URL(route.request().url());
    const endpoint = url.pathname.split('/').pop()!;
    const part = url.searchParams.get('part') ?? '';
    const type = url.searchParams.get('type') ?? '';
    const chart = url.searchParams.get('chart') ?? '';
    const idParam = url.searchParams.get('id') ?? '';
    const ids = idParam ? idParam.split(',').filter(Boolean) : [];

    if (endpoint === 'videos') {
      if (chart === 'mostPopular') {
        await route.fulfill({ json: { kind: 'youtube#videoListResponse', items: makeVideoItems(25) } });
      } else if (part.includes('contentDetails')) {
        const items = ids.map((id) => ({ id, contentDetails: { duration: 'PT4M30S' } }));
        await route.fulfill({ json: { items } });
      } else if (part.includes('statistics')) {
        const items = ids.map((id, i) => ({
          id,
          statistics: { viewCount: String(1000000 - i * 10000), likeCount: '50000' },
        }));
        await route.fulfill({ json: { items } });
      } else {
        await route.fulfill({ json: { items: makeVideoItems(10) } });
      }
    } else if (endpoint === 'search') {
      if (type === 'channel') {
        const items = Array.from({ length: 5 }, (_, i) => ({
          id: { channelId: `ch${i + 1}` },
          snippet: { title: `뉴진스 채널 ${i + 1}`, channelId: `ch${i + 1}` },
        }));
        await route.fulfill({ json: { items } });
      } else {
        const items = Array.from({ length: 10 }, (_, i) => ({
          id: { videoId: `searchvid${i + 1}` },
          snippet: {
            title: `뉴진스 영상 ${i + 1}`,
            channelTitle: '뉴진스 채널',
            publishedAt: '2026-01-10T00:00:00Z',
          },
        }));
        await route.fulfill({ json: { items } });
      }
    } else if (endpoint === 'channels') {
      const channelIds = ids.length > 0 ? ids : Array.from({ length: 5 }, (_, i) => `ch${i + 1}`);
      await route.fulfill({ json: { items: makeChannelItems(channelIds) } });
    } else {
      await route.fulfill({ json: { items: [] } });
    }
  });
}
