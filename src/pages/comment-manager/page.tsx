import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import StatCards from './components/StatCards';
import CommentCharts from './components/CommentCharts';
import AllChannelsOverview from './components/AllChannelsOverview';
import { statsByChannel } from '@/mocks/commentManager';
import FilterBar from './components/FilterBar';
import CommentFeed from './components/CommentFeed';
import RightSidebar from './components/RightSidebar';
import { commentsByChannel } from '@/mocks/commentManager';
import type { Comment, Platform, Sentiment } from '@/mocks/commentManager';
import GlobalSidebar from '@/components/feature/GlobalSidebar';
import TopHeader from '@/pages/home/components/TopHeader';

type ViewMode = 'overview' | 'channel';

type PlatformFilter = 'all' | Platform;
type SentimentFilter = 'all' | Sentiment;

type PlatformGroup = 'YouTube Channels' | 'Other Platforms';

interface ManagedChannel {
  id: string;
  name: string;
  avatar: string;
  platform: Platform;
  subs: string;
  pending: number;
  group: PlatformGroup;
}

const MANAGED_CHANNELS: ManagedChannel[] = [
  {
    id: 'ch-main',
    name: 'ViralBoard Official',
    avatar: 'https://readdy.ai/api/search-image?query=modern%20tech%20brand%20logo%20icon%2C%20red%20gradient%2C%20clean%20minimal%20design%2C%20dark%20background&width=64&height=64&seq=ch-main&orientation=squarish',
    platform: 'youtube',
    subs: '1.2M',
    pending: 14,
    group: 'YouTube Channels',
  },
  {
    id: 'ch-gaming',
    name: 'VB Gaming',
    avatar: 'https://readdy.ai/api/search-image?query=gaming%20channel%20logo%2C%20neon%20purple%20controller%20icon%2C%20dark%20background%2C%20esports%20style&width=64&height=64&seq=ch-gaming&orientation=squarish',
    platform: 'youtube',
    subs: '340K',
    pending: 7,
    group: 'YouTube Channels',
  },
  {
    id: 'ch-yt2',
    name: 'ViralBoard Shorts',
    avatar: 'https://readdy.ai/api/search-image?query=youtube%20shorts%20channel%20logo%2C%20bold%20red%20icon%2C%20minimal%20design%2C%20clean%20background&width=64&height=64&seq=ch-yt2&orientation=squarish',
    platform: 'youtube',
    subs: '218K',
    pending: 3,
    group: 'YouTube Channels',
  },
  {
    id: 'ch-yt3',
    name: 'VB Finance',
    avatar: 'https://readdy.ai/api/search-image?query=finance%20youtube%20channel%20logo%2C%20gold%20and%20dark%20minimal%20design%2C%20professional%20icon&width=64&height=64&seq=ch-yt3&orientation=squarish',
    platform: 'youtube',
    subs: '95K',
    pending: 2,
    group: 'YouTube Channels',
  },
  {
    id: 'ch-tiktok',
    name: '@viralboard',
    avatar: 'https://readdy.ai/api/search-image?query=tiktok%20creator%20profile%20photo%2C%20young%20person%20smiling%2C%20colorful%20background%2C%20social%20media&width=64&height=64&seq=ch-tiktok&orientation=squarish',
    platform: 'tiktok',
    subs: '89K',
    pending: 3,
    group: 'Other Platforms',
  },
  {
    id: 'ch-ig',
    name: 'viralboard.ig',
    avatar: 'https://readdy.ai/api/search-image?query=instagram%20brand%20profile%20photo%2C%20lifestyle%20aesthetic%2C%20warm%20tones%2C%20clean%20background&width=64&height=64&seq=ch-ig&orientation=squarish',
    platform: 'instagram',
    subs: '52K',
    pending: 5,
    group: 'Other Platforms',
  },
  {
    id: 'ch-fb',
    name: 'ViralBoard FB',
    avatar: 'https://readdy.ai/api/search-image?query=facebook%20page%20brand%20logo%2C%20blue%20social%20media%20icon%2C%20clean%20minimal%20design&width=64&height=64&seq=ch-fb&orientation=squarish',
    platform: 'facebook',
    subs: '124K',
    pending: 4,
    group: 'Other Platforms',
  },
];

const PLATFORM_ICON: Record<Platform, string> = {
  youtube: 'ri-youtube-line',
  tiktok: 'ri-tiktok-line',
  instagram: 'ri-instagram-line',
  facebook: 'ri-facebook-circle-line',
};

const PLATFORM_COLOR: Record<Platform, string> = {
  youtube: 'text-red-500',
  tiktok: 'text-pink-500',
  instagram: 'text-orange-500',
  facebook: 'text-blue-500',
};

const PLATFORM_BG: Record<Platform, string> = {
  youtube: 'bg-red-50 dark:bg-red-500/10',
  tiktok: 'bg-pink-50 dark:bg-pink-500/10',
  instagram: 'bg-orange-50 dark:bg-orange-500/10',
  facebook: 'bg-blue-50 dark:bg-blue-500/10',
};

const GROUPS: PlatformGroup[] = ['YouTube Channels', 'Other Platforms'];

const CommentManagerPage = () => {
  const [platform, setPlatform] = useState<PlatformFilter>('all');
  const [sentiment, setSentiment] = useState<SentimentFilter>('all');
  const [dateRange, setDateRange] = useState('Today');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('ch-main');
  const [channelDropdownOpen, setChannelDropdownOpen] = useState(false);

  const handleSelectChannelFromOverview = (id: string) => {
    setSelectedChannelId(id);
    setViewMode('channel');
  };

  const selectedChannel = MANAGED_CHANNELS.find((c) => c.id === selectedChannelId) ?? MANAGED_CHANNELS[0];

  // Per-channel comment map — initialize all channels
  const [channelCommentMap, setChannelCommentMap] = useState<Record<string, Comment[]>>(() =>
    Object.fromEntries(
      MANAGED_CHANNELS.map((ch) => [ch.id, [...(commentsByChannel[ch.id] ?? [])]])
    )
  );

  // Current channel's comments
  const comments = channelCommentMap[selectedChannelId] ?? [];
  const setComments = (updater: (prev: Comment[]) => Comment[]) => {
    setChannelCommentMap((prev) => ({
      ...prev,
      [selectedChannelId]: updater(prev[selectedChannelId] ?? []),
    }));
  };

  const filteredComments = useMemo(() => {
    return comments.filter((c) => {
      if (platform !== 'all' && c.platform !== platform) return false;
      if (sentiment !== 'all' && c.sentiment !== sentiment) return false;
      return true;
    });
  }, [comments, platform, sentiment]);

  const pendingCount = comments.filter((c) => c.status === 'pending').length;

  // Total pending across all channels
  const totalPending = MANAGED_CHANNELS.reduce((sum, ch) => {
    const chComments = channelCommentMap[ch.id] ?? [];
    return sum + chComments.filter((c) => c.status === 'pending').length;
  }, 0);

  const handleApprove = (id: string) => {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'approved' } : c)));
  };

  const handleSkip = (id: string) => {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'skipped' } : c)));
  };

  const handleEdit = (id: string, newReply: string) => {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, aiReply: newReply } : c)));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-base text-gray-900 dark:text-off-white transition-colors">

      {/* ── Shared Top Header ── */}
      <TopHeader onMobileMenuToggle={() => setMobileNavOpen((v) => !v)} />

      {/* ── Global Sidebar ── */}
      <GlobalSidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      {/* ── Page content ── */}
      <div className="lg:ml-52 pt-12 flex flex-col flex-1 min-h-0">

        {/* ── Sub-header ── */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 lg:px-6 py-2.5 border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card transition-colors sticky top-12 z-20 min-h-[48px]">

          {/* Left: icon + title + pending badge */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/15 flex-shrink-0">
              <i className="ri-chat-settings-line text-red-500 dark:text-red-400 text-sm"></i>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-off-white whitespace-nowrap hidden sm:block">AI Comment Manager</span>
            {totalPending > 0 && (
              <span className="text-xs bg-orange-100 dark:bg-orange-500/15 border border-orange-200 dark:border-orange-500/25 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                {totalPending} pending
              </span>
            )}
          </div>

          {/* View mode switcher */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-lg p-0.5 flex-shrink-0">
            <button
              onClick={() => setViewMode('overview')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                viewMode === 'overview'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
              }`}
            >
              <i className="ri-layout-grid-line w-3 h-3 flex items-center justify-center"></i>
              <span className="hidden sm:inline">Overview</span>
            </button>
            <button
              onClick={() => setViewMode('channel')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                viewMode === 'channel'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
              }`}
            >
              <i className="ri-chat-3-line w-3 h-3 flex items-center justify-center"></i>
              <span className="hidden sm:inline">Channel</span>
            </button>
          </div>

          {/* Center: Channel selector + platform badge — only in channel view */}
          {viewMode === 'channel' && (
            <>
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setChannelDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 bg-gray-50 dark:bg-dark-base hover:bg-gray-100 dark:hover:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer min-w-0"
                >
                  <div className={`w-5 h-5 rounded-full overflow-hidden flex-shrink-0 ${PLATFORM_BG[selectedChannel.platform]} flex items-center justify-center`}>
                    <i className={`${PLATFORM_ICON[selectedChannel.platform]} ${PLATFORM_COLOR[selectedChannel.platform]} text-xs`}></i>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-off-white truncate max-w-[130px]">{selectedChannel.name}</span>
                  {pendingCount > 0 && (
                    <span className="text-[10px] bg-orange-400 text-white px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 leading-none">
                      {pendingCount}
                    </span>
                  )}
                  <i className={`ri-arrow-down-s-line text-gray-400 dark:text-white/40 text-xs w-3 h-3 flex items-center justify-center transition-transform flex-shrink-0 ${channelDropdownOpen ? 'rotate-180' : ''}`}></i>
                </button>

                {channelDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setChannelDropdownOpen(false)} />
                    <div className="absolute left-0 top-full mt-1.5 w-72 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden z-30">
                      <div className="px-3 py-2.5 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest">
                          {MANAGED_CHANNELS.length} Managed Channels
                        </p>
                        <span className="text-[10px] text-orange-500 font-bold">{totalPending} pending total</span>
                      </div>
                      {GROUPS.map((group) => {
                        const groupChannels = MANAGED_CHANNELS.filter((ch) => ch.group === group);
                        return (
                          <div key={group}>
                            <div className="px-3 pt-2.5 pb-1">
                              <p className="text-[10px] font-bold text-gray-300 dark:text-white/20 uppercase tracking-widest flex items-center gap-1.5">
                                {group === 'YouTube Channels' && <i className="ri-youtube-line text-red-400 text-xs w-3 h-3 flex items-center justify-center"></i>}
                                {group === 'Other Platforms' && <i className="ri-global-line text-gray-400 text-xs w-3 h-3 flex items-center justify-center"></i>}
                                {group}
                              </p>
                            </div>
                            {groupChannels.map((ch) => {
                              const chPending = (channelCommentMap[ch.id] ?? []).filter((c) => c.status === 'pending').length;
                              return (
                                <button
                                  key={ch.id}
                                  onClick={() => { setSelectedChannelId(ch.id); setChannelDropdownOpen(false); }}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-dark-surface text-left ${selectedChannelId === ch.id ? 'bg-red-50 dark:bg-red-500/10' : ''}`}
                                >
                                  <div className="relative flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-base">
                                      <img src={ch.avatar} alt={ch.name} className="w-full h-full object-cover object-top" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    </div>
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ${PLATFORM_BG[ch.platform]} border border-white dark:border-dark-card`}>
                                      <i className={`${PLATFORM_ICON[ch.platform]} ${PLATFORM_COLOR[ch.platform]} text-[9px]`}></i>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className={`text-sm font-semibold truncate block ${selectedChannelId === ch.id ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-off-white'}`}>{ch.name}</span>
                                    <p className="text-xs text-gray-400 dark:text-white/30">{ch.subs} followers</p>
                                  </div>
                                  {chPending > 0 && (
                                    <span className="text-xs bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">{chPending}</span>
                                  )}
                                  {selectedChannelId === ch.id && (
                                    <i className="ri-check-line text-red-500 dark:text-red-400 w-4 h-4 flex items-center justify-center flex-shrink-0"></i>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                      <div className="px-3 py-2.5 border-t border-gray-100 dark:border-dark-border">
                        <button className="w-full flex items-center gap-2 text-xs text-gray-400 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer py-1 group">
                          <div className="w-5 h-5 rounded-full border border-dashed border-gray-300 dark:border-white/20 group-hover:border-red-400 flex items-center justify-center transition-colors">
                            <i className="ri-add-line text-[10px]"></i>
                          </div>
                          Add another channel
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Platform badge */}
              <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg ${PLATFORM_BG[selectedChannel.platform]}`}>
                <i className={`${PLATFORM_ICON[selectedChannel.platform]} ${PLATFORM_COLOR[selectedChannel.platform]} text-xs w-3 h-3 flex items-center justify-center`}></i>
                <span className={`text-xs font-medium capitalize ${PLATFORM_COLOR[selectedChannel.platform]}`}>{selectedChannel.platform}</span>
              </div>
            </>
          )}

          {/* Live sync indicator */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/25">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span>Live sync</span>
          </div>

          {/* Right: actions */}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="xl:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-off-white hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors cursor-pointer"
            >
              <i className="ri-settings-3-line text-sm"></i>
            </button>

            <button
              onClick={() => setComments((prev) => prev.map((c) => c.status === 'pending' ? { ...c, status: 'approved' } : c))}
              className="hidden sm:flex items-center gap-1.5 bg-green-50 dark:bg-green-600/15 hover:bg-green-100 dark:hover:bg-green-600/25 border border-green-200 dark:border-green-500/25 text-green-600 dark:text-green-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-check-double-line w-3 h-3 flex items-center justify-center"></i>
              Approve All
            </button>

            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-border text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-off-white text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-dashboard-line w-3 h-3 flex items-center justify-center"></i>
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Main layout */}
        <div className="flex-1 flex overflow-auto">

          {/* ── OVERVIEW MODE ── */}
          {viewMode === 'overview' && (
            <div className="flex-1 min-w-0">
              <div className="px-4 lg:px-6 py-5">
                <AllChannelsOverview
                  channels={MANAGED_CHANNELS}
                  channelCommentMap={channelCommentMap}
                  onSelectChannel={handleSelectChannelFromOverview}
                />
              </div>
            </div>
          )}

          {/* ── CHANNEL MODE ── */}
          {viewMode === 'channel' && (
            <>
              {/* Center: main content */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="px-4 lg:px-6 py-5 space-y-4">
                  <StatCards stats={statsByChannel[selectedChannelId]} />

                  <CommentCharts comments={comments} />

                  <FilterBar
                    platform={platform}
                    sentiment={sentiment}
                    dateRange={dateRange}
                    onPlatformChange={setPlatform}
                    onSentimentChange={setSentiment}
                    onDateRangeChange={setDateRange}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-off-white">Comment Feed</h2>
                      <span className="text-xs text-gray-500 dark:text-white/30 bg-gray-100 dark:bg-dark-surface px-2 py-0.5 rounded-full">
                        {filteredComments.length} comments
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 dark:text-white/25">Sort by:</span>
                      <button className="text-xs text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-off-white flex items-center gap-1 cursor-pointer transition-colors">
                        Latest first
                        <i className="ri-arrow-down-s-line w-3 h-3 flex items-center justify-center"></i>
                      </button>
                    </div>
                  </div>

                  <CommentFeed
                    comments={filteredComments}
                    onApprove={handleApprove}
                    onSkip={handleSkip}
                    onEdit={handleEdit}
                  />

                  <div className="h-4"></div>
                </div>
              </div>

              {/* Right sidebar */}
              <>
                {sidebarOpen && (
                  <div className="xl:hidden fixed inset-0 bg-black/50 z-20" onClick={() => setSidebarOpen(false)} />
                )}
                <aside
                  className={`
                    flex-shrink-0 border-l border-gray-200 dark:border-dark-border overflow-y-auto
                    bg-white dark:bg-dark-card transition-colors
                    xl:sticky xl:top-24 xl:self-start xl:max-h-[calc(100vh-6rem)]
                    fixed right-0 top-0 bottom-0 z-30
                    ${sidebarOpen ? 'flex flex-col translate-x-0' : 'hidden xl:flex translate-x-full xl:translate-x-0'}
                  `}
                  style={{ width: '300px' }}
                >
                  <div className="xl:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
                    <span className="text-sm font-semibold text-gray-900 dark:text-off-white">AI Settings</span>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-off-white hover:bg-gray-100 dark:hover:bg-dark-surface cursor-pointer transition-colors"
                    >
                      <i className="ri-close-line text-sm"></i>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    <RightSidebar />
                  </div>
                </aside>
              </>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentManagerPage;
