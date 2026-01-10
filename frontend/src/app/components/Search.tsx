import { Search as SearchIcon, X, Clock, Home, Users, Bookmark, User, Play, Loader2, HardDrive, Users as UsersIcon, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Page } from '../App';
import type { TorrentResult } from '../types';
import { searchAllSites } from '../services/api';

interface SearchProps {
  onNavigate: (page: Page, movieId?: string) => void;
  onSelectTorrent?: (torrent: TorrentResult) => void;
}

const trendingParties = [
  { id: '1', title: 'Midnight Horror Marathon', viewers: '1.2k', status: 'Started 10m ago', image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&h=400&fit=crop' },
  { id: '2', title: 'Behind the Scenes: Dune', viewers: 'Docu-series • Season 1', image: 'https://images.unsplash.com/photo-1574267432644-f610c7c8bb08?w=600&h=400&fit=crop' },
  { id: '3', title: 'Classic Cinema Club', viewers: '456', status: 'Started 30m ago', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop' },
];

export function Search({ onNavigate, onSelectTorrent }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TorrentResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>('all');

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await searchAllSites(query, {
        sortBy: 'seeders',
        limit: 30,
        quality: selectedQuality !== 'all' ? selectedQuality : undefined,
      });
      setResults(response.results);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleResultClick = (result: TorrentResult) => {
    if (onSelectTorrent && result.Magnet) {
      onSelectTorrent(result);
      onNavigate('watch', result.InfoHash || result.Name);
    } else {
      onNavigate('details', result.Name);
    }
  };

  const formatSize = (size: string) => {
    return size || 'Unknown';
  };

  const getQualityBadge = (name: string) => {
    if (name.includes('2160p') || name.includes('4K')) return '4K';
    if (name.includes('1080p')) return '1080p';
    if (name.includes('720p')) return '720p';
    if (name.includes('480p')) return '480p';
    return null;
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-full border-r border-white/5 bg-[#181118]">
        <div className="p-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center shadow-[0_0_15px_rgba(244,37,244,0.3)]">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-white text-xl font-bold tracking-tight">CineParty</h1>
        </div>
        <nav className="flex-1 flex flex-col gap-2 px-4 mt-4">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors group">
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">Home</span>
          </button>
          <button className="flex items-center gap-4 px-4 py-3 bg-primary/10 text-white rounded-xl transition-colors border border-primary/20 shadow-[0_0_10px_rgba(244,37,244,0.1)]">
            <SearchIcon className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Search</span>
          </button>
          <button className="flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors group">
            <Bookmark className="w-5 h-5" />
            <span className="text-sm font-medium">Watchlist</span>
          </button>
          <button className="flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors group">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Friends</span>
          </button>
          <button className="flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors group">
            <User className="w-5 h-5" />
            <span className="text-sm font-medium">Profile</span>
          </button>
        </nav>
        <div className="p-6">
          <div className="bg-gradient-to-br from-secondary to-black p-4 rounded-xl border border-white/5">
            <p className="text-xs text-gray-400 mb-2">Currently Watching</p>
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border border-primary"></div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">Sarah's Party</span>
                <span className="text-xs text-primary">In Progress</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-background">
        {/* Cinematic Background Glow */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background/50 to-transparent pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:px-12 md:py-14 flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-lg">What are we watching tonight?</h2>
            <p className="text-gray-400 text-lg">Search movies, series, and start a watch party.</p>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-4xl">
            <label className="group relative flex items-center w-full h-16 rounded-2xl bg-secondary/80 backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary focus-within:shadow-[0_0_20px_rgba(244,37,244,0.25)]">
              <div className="pl-6 pr-4 text-gray-400 group-focus-within:text-primary transition-colors">
                <SearchIcon className="w-7 h-7" />
              </div>
              <input
                className="w-full h-full bg-transparent border-none text-white text-xl placeholder-gray-500 focus:ring-0 focus:outline-none"
                placeholder="Search movies, series..."
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              {query && (
                <div className="pr-4">
                  <button onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }} className="text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              <button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="mr-2 px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
              </button>
            </label>
          </div>

          {/* Quality Filters */}
          <div className="flex flex-wrap gap-3">
            {['all', '720p', '1080p', '4K'].map((quality) => (
              <button
                key={quality}
                onClick={() => setSelectedQuality(quality)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${selectedQuality === quality
                    ? 'bg-primary text-white shadow-[0_0_10px_rgba(244,37,244,0.4)]'
                    : 'bg-secondary border border-white/10 text-gray-300 hover:bg-secondary hover:border-gray-500 hover:text-white'
                  }`}
              >
                {quality === 'all' ? 'All Quality' : quality}
              </button>
            ))}
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-gray-400">Searching across all torrent sites...</p>
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <SearchIcon className="w-16 h-16 text-gray-600" />
              <p className="text-gray-400 text-lg">No results found for "{query}"</p>
              <p className="text-gray-500 text-sm">Try a different search term</p>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{results.length} Results</h3>
                <span className="text-sm text-gray-500">Sorted by seeders</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {results.map((result, index) => {
                  const quality = getQualityBadge(result.Name);
                  return (
                    <div
                      key={`${result.InfoHash || index}`}
                      onClick={() => handleResultClick(result)}
                      className="group flex items-center gap-4 p-4 bg-secondary/50 hover:bg-secondary rounded-xl border border-white/5 hover:border-primary/30 cursor-pointer transition-all duration-200"
                    >
                      {/* Poster/Icon */}
                      <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-primary/30 to-purple-900/30 flex items-center justify-center shrink-0 group-hover:shadow-[0_0_15px_rgba(244,37,244,0.2)] transition-shadow">
                        <Play className="w-8 h-8 text-primary/60 group-hover:text-primary transition-colors" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate group-hover:text-primary transition-colors">
                          {result.Name}
                        </h4>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {quality && (
                            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold">
                              {quality}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-gray-400 text-sm">
                            <HardDrive className="w-3.5 h-3.5" />
                            {formatSize(result.Size)}
                          </span>
                          <span className="flex items-center gap-1 text-green-400 text-sm">
                            <UsersIcon className="w-3.5 h-3.5" />
                            {result.Seeders} seeders
                          </span>
                          <span className="text-gray-500 text-xs uppercase">{result.source}</span>
                        </div>
                      </div>

                      {/* Action */}
                      <button
                        className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary hover:text-white transition-colors flex items-center gap-2 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResultClick(result);
                        }}
                      >
                        <Play className="w-4 h-4" />
                        Watch
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Recent Searches */}
              <div className="flex flex-col gap-4 py-4 border-b border-white/5 pb-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Recent Searches</h3>
                <div className="flex flex-wrap gap-4">
                  {['Avengers Endgame', 'Breaking Bad', 'Interstellar'].map((term) => (
                    <div
                      key={term}
                      onClick={() => { setQuery(term); }}
                      className="flex items-center gap-2 text-gray-300 hover:text-primary cursor-pointer transition-colors group"
                    >
                      <Clock className="w-5 h-5 text-gray-500 group-hover:text-primary" />
                      <span>{term}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Section */}
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-end">
                  <h3 className="text-xl font-bold text-white">Trending on CineParty</h3>
                  <a className="text-primary text-sm font-medium hover:text-white transition-colors cursor-pointer">View All</a>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {trendingParties.map((party) => (
                    <div key={party.id} className="w-64 shrink-0 group rounded-xl bg-secondary border border-white/5 p-3 hover:bg-secondary/80 transition-colors cursor-pointer" onClick={() => onNavigate('watch', party.id)}>
                      <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                        <img
                          alt={party.title}
                          className="w-full h-full object-cover"
                          src={party.image}
                        />
                        {party.status && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
                            Live Now
                          </div>
                        )}
                      </div>
                      <h4 className="text-white font-bold text-base truncate">{party.title}</h4>
                      <p className="text-gray-400 text-xs mt-1">
                        {party.status ? `${party.viewers} watching • ${party.status}` : party.viewers}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
