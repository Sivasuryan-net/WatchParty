import { Play, Plus, ThumbsUp, Share2, Bell, Star, ChevronRight, X, Loader2, HardDrive, Users as UsersIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Page } from '../App';
import type { TorrentResult } from '../types';
import { searchAllSites } from '../services/api';

interface MovieDetailsProps {
  onNavigate: (page: Page, movieId?: string) => void;
  movieId: string | null;
  onSelectTorrent?: (torrent: TorrentResult) => void;
}

const cast = [
  { name: 'Matthew M.', role: 'Cooper', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { name: 'Anne H.', role: 'Brand', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
  { name: 'Jessica C.', role: 'Murph', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' },
  { name: 'Michael C.', role: 'Prof. Brand', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
  { name: 'Matt D.', role: 'Mann', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop' },
];

export function MovieDetails({ onNavigate, movieId, onSelectTorrent }: MovieDetailsProps) {
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [sources, setSources] = useState<TorrentResult[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);

  const movieTitle = movieId || 'Interstellar';

  const handleStartParty = async () => {
    setShowSourceModal(true);
    setIsLoadingSources(true);

    try {
      const response = await searchAllSites(movieTitle, {
        sortBy: 'seeders',
        limit: 10,
      });
      setSources(response.results.filter(r => r.Magnet));
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    } finally {
      setIsLoadingSources(false);
    }
  };

  const handleSelectSource = (source: TorrentResult) => {
    if (onSelectTorrent) {
      onSelectTorrent(source);
    }
    setShowSourceModal(false);
    onNavigate('watch', movieId || undefined);
  };

  const getQualityBadge = (name: string) => {
    if (name.includes('2160p') || name.includes('4K')) return '4K';
    if (name.includes('1080p')) return '1080p';
    if (name.includes('720p')) return '720p';
    if (name.includes('480p')) return '480p';
    return null;
  };

  return (
    <div className="dark min-h-screen bg-background text-white flex flex-col">
      {/* Source Selection Modal */}
      {showSourceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1c1520] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white">Select Source</h3>
                <p className="text-sm text-gray-400 mt-1">Choose a stream quality for "{movieTitle}"</p>
              </div>
              <button
                onClick={() => setShowSourceModal(false)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {isLoadingSources ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-gray-400">Finding best sources...</p>
                </div>
              ) : sources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <p className="text-gray-400">No sources found</p>
                  <button
                    onClick={() => onNavigate('search')}
                    className="px-4 py-2 rounded-lg bg-primary text-white font-medium"
                  >
                    Search Manually
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sources.map((source, index) => {
                    const quality = getQualityBadge(source.Name);
                    return (
                      <button
                        key={source.InfoHash || index}
                        onClick={() => handleSelectSource(source)}
                        className="w-full flex items-center gap-4 p-4 bg-secondary/50 hover:bg-secondary rounded-xl border border-white/5 hover:border-primary/30 transition-all text-left group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                          <Play className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate group-hover:text-primary transition-colors">
                            {source.Name}
                          </p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {quality && (
                              <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold">
                                {quality}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-gray-400 text-sm">
                              <HardDrive className="w-3.5 h-3.5" />
                              {source.Size}
                            </span>
                            <span className="flex items-center gap-1 text-green-400 text-sm">
                              <UsersIcon className="w-3.5 h-3.5" />
                              {source.Seeders} seeders
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-6 lg:px-10 py-3 bg-[#181118]/90 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-white cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onNavigate('home')}>
            <div className="w-6 h-6 text-primary">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-tight">CineParty</h2>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-sm font-medium leading-normal hover:text-primary transition-colors cursor-pointer" onClick={() => onNavigate('home')}>Movies</a>
            <a className="text-sm font-medium leading-normal hover:text-primary transition-colors cursor-pointer" onClick={() => onNavigate('search')}>Search</a>
            <a className="text-sm font-medium leading-normal hover:text-primary transition-colors cursor-pointer">My Watchlist</a>
          </nav>
        </div>
        <div className="flex flex-1 justify-end gap-6 items-center">
          <label className="hidden sm:flex flex-col min-w-40 h-10 max-w-64 relative group">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-secondary group-focus-within:ring-2 ring-primary/50 transition-all">
              <div className="text-gray-500 flex items-center justify-center pl-3 pr-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                className="flex w-full min-w-0 flex-1 bg-transparent border-none text-white focus:outline-0 focus:ring-0 placeholder:text-gray-500 px-2 text-sm"
                placeholder="Search titles..."
                onClick={() => onNavigate('search')}
                readOnly
              />
            </div>
          </label>
          <div className="flex items-center gap-3">
            <button className="relative bg-secondary p-2 rounded-full hover:bg-accent transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-secondary"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-transparent hover:border-primary cursor-pointer transition-colors"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col w-full">
        {/* Hero Section */}
        <div className="relative w-full min-h-[85vh] flex flex-col justify-end pb-12 lg:pb-20">
          {/* Background Image */}
          <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1920&h=1080&fit=crop)' }}>
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#181118] via-[#181118]/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#181118]/90 via-transparent to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="px-6 lg:px-40 relative z-10 w-full flex justify-center">
            <div className="max-w-[1200px] w-full grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 items-end">
              {/* Left Column */}
              <div className="flex flex-col gap-6">
                {/* Chips */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-semibold uppercase tracking-wider text-white">PG-13</span>
                  <span className="px-3 py-1 rounded bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-semibold uppercase tracking-wider text-white">2014</span>
                  <span className="px-3 py-1 rounded bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-semibold uppercase tracking-wider text-white">2h 49m</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                    {movieTitle}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-400 text-lg font-medium mt-2">
                    <span>Sci-Fi</span>
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    <span>Adventure</span>
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    <span>Drama</span>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mt-4">
                  <button onClick={handleStartParty} className="flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-[0_0_20px_rgba(244,37,244,0.3)] hover:shadow-[0_0_30px_rgba(244,37,244,0.5)] transition-all transform hover:-translate-y-0.5 group">
                    <Play className="w-5 h-5 group-hover:animate-pulse fill-current" />
                    <span>Start Watch Party</span>
                  </button>
                  <div className="flex gap-2">
                    <button className="flex items-center justify-center w-14 h-14 rounded-lg bg-secondary/50 backdrop-blur-md border border-white/10 hover:bg-secondary text-white transition-colors" title="Add to Watchlist">
                      <Plus className="w-5 h-5" />
                    </button>
                    <button className="flex items-center justify-center w-14 h-14 rounded-lg bg-secondary/50 backdrop-blur-md border border-white/10 hover:bg-secondary text-white transition-colors" title="Like">
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                    <button className="flex items-center justify-center w-14 h-14 rounded-lg bg-secondary/50 backdrop-blur-md border border-white/10 hover:bg-secondary text-white transition-colors" title="Share">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Right Column: Ratings */}
              <div className="hidden lg:flex flex-col justify-end items-end gap-4 pb-2">
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-bold text-white tracking-tighter">8.6</span>
                  <div className="flex flex-col mb-2">
                    <div className="flex text-yellow-400 gap-1 text-xl">
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current stroke-current" />
                    </div>
                    <span className="text-sm text-gray-400 font-medium">12k global reviews</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="px-6 lg:px-40 py-12 flex justify-center bg-[#181118]">
          <div className="max-w-[1200px] w-full grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-16">
            {/* Left Content */}
            <div className="flex flex-col gap-12">
              {/* Synopsis */}
              <section>
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  Synopsis
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed font-light">
                  Earth's future has been riddled by disasters, famines, and droughts. There is only one way to ensure mankind's survival: Interstellar travel. A newly discovered wormhole in the far reaches of our solar system allows a team of astronauts to go where no man has gone before, a planet that may have the right environment to sustain human life.
                </p>
              </section>

              {/* Cast */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    Top Cast
                  </h3>
                  <a className="text-primary text-sm font-medium hover:underline cursor-pointer">View All</a>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
                  {cast.map((actor, index) => (
                    <div key={index} className="flex flex-col items-center gap-3 min-w-[100px] snap-start group cursor-pointer">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
                        <img
                          alt={actor.name}
                          className="w-full h-full object-cover"
                          src={actor.image}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-medium text-sm">{actor.name}</p>
                        <p className="text-gray-400 text-xs">{actor.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Content */}
            <div className="flex flex-col gap-8">
              {/* Info Card */}
              <div className="bg-secondary rounded-xl p-6 border border-white/5">
                <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Information</h4>
                <ul className="flex flex-col gap-4">
                  <li className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <span className="text-gray-400 text-sm">Director</span>
                    <span className="text-white font-medium text-right">Christopher Nolan</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <span className="text-gray-400 text-sm">Production</span>
                    <span className="text-white font-medium text-right">Legendary Pictures</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <span className="text-gray-400 text-sm">Language</span>
                    <span className="text-white font-medium text-right">English</span>
                  </li>
                </ul>
              </div>

              {/* Reviews Summary */}
              <div className="bg-secondary rounded-xl p-6 border border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-white font-bold text-sm uppercase tracking-wider text-gray-400">User Reviews</h4>
                  <ChevronRight className="w-5 h-5 text-gray-500 cursor-pointer hover:text-white" />
                </div>
                <div className="grid grid-cols-[20px_1fr_40px] items-center gap-y-3">
                  {[
                    { stars: 5, width: 70 },
                    { stars: 4, width: 20 },
                    { stars: 3, width: 5 },
                    { stars: 2, width: 3 },
                    { stars: 1, width: 2 },
                  ].map((item) => (
                    <>
                      <p className="text-white text-sm font-normal leading-normal">{item.stars}</p>
                      <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-accent">
                        <div className="rounded-full bg-primary" style={{ width: `${item.width}%`, opacity: 1 - (5 - item.stars) * 0.2 }}></div>
                      </div>
                      <p className="text-gray-400 text-sm font-normal leading-normal text-right">{item.width}%</p>
                    </>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
