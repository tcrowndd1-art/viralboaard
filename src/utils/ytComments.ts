interface Comment {
  author: string;
  authorProfileImageUrl: string;
  text: string;
  likeCount: number;
}

const stripHtml = (html: string) =>
  html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');

export type { Comment };

export async function fetchYouTubeComments(videoId: string, maxResults = 20): Promise<
  | { ok: true; comments: Comment[] }
  | { ok: false; disabled: boolean; error: string | null }
> {
  const key = import.meta.env['VITE_YOUTUBE_API_KEY_1'];
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxResults}&order=relevance&key=${key}`
  );
  const json = await res.json();
  if (!res.ok) {
    const disabled =
      json.error?.code === 403 ||
      json.error?.errors?.[0]?.reason === 'commentsDisabled';
    return { ok: false, disabled, error: disabled ? null : '댓글을 불러올 수 없습니다' };
  }
  const comments: Comment[] = (json.items ?? []).map((item: Record<string, unknown>) => {
    const s = (item.snippet as Record<string, unknown>)?.topLevelComment as Record<string, unknown>;
    const sn = s?.snippet as Record<string, unknown> ?? {};
    return {
      author: String(sn.authorDisplayName ?? ''),
      authorProfileImageUrl: String(sn.authorProfileImageUrl ?? ''),
      text: stripHtml(String(sn.textDisplay ?? '')),
      likeCount: Number(sn.likeCount ?? 0),
    };
  });
  return { ok: true, comments };
}
