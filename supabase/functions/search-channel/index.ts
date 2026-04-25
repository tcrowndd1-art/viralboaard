import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Query too short' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const YOUTUBE_KEY = Deno.env.get('YOUTUBE_API_KEY_1')
    if (!YOUTUBE_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=8&key=${YOUTUBE_KEY}`
    const searchRes = await fetch(searchUrl)
    const searchData = await searchRes.json()

    if (!searchData.items || searchData.items.length === 0) {
      return new Response(
        JSON.stringify({ channels: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const channelIds = searchData.items.map((i: any) => i.id.channelId).join(',')
    const detailUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds}&key=${YOUTUBE_KEY}`
    const detailRes = await fetch(detailUrl)
    const detailData = await detailRes.json()

    const channels = (detailData.items || []).map((item: any) => ({
      channel_id: item.id,
      channel_name: item.snippet.title,
      description: item.snippet.description?.slice(0, 200) || '',
      avatar: item.snippet.thumbnails?.default?.url || '',
      subscriber_count: parseInt(item.statistics?.subscriberCount || '0'),
      video_count: parseInt(item.statistics?.videoCount || '0'),
      view_count: parseInt(item.statistics?.viewCount || '0'),
      country: item.snippet.country || null,
    }))

    return new Response(
      JSON.stringify({ channels }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e).slice(0, 100) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
