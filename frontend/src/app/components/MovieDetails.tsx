import { Play, Plus, ThumbsUp, Share2, Bell, Star, ChevronRight, X, Loader2, HardDrive, Users as UsersIcon, ArrowLeft, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Page } from '../App';
import type { TorrentResult } from '../types';
import { searchAllSites } from '../services/api';
import { getIMDBMovie, type IMDBMovieDetails } from '../services/imdb';

interface MovieDetailsProps {
  onNavigate: (page: Page, movieId?: string) => void;
  movieId: string | null;
  onSelectTorrent?: (torrent: TorrentResult, runtime?: number) => void;
}

export function MovieDetails({ onNavigate, movieId, onSelectTorrent }: MovieDetailsProps) {
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [sources, setSources] = useState<TorrentResult[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [movie, setMovie] = useState<IMDBMovieDetails | null>(null);
  const [isLoadingMovie, setIsLoadingMovie] = useState(true);

  // Parse movieId which can be "imdbId|coming|title" or "imdbId|title" format
  const parseMovieId = () => {
    if (!movieId) return { imdbId: null, title: 'Interstellar', isComingSoon: false };
    const parts = movieId.split('|');
    if (parts.length >= 2) {
      const imdbId = parts[0];
      const isComingSoon = parts[1] === 'coming';
      const title = isComingSoon ? parts.slice(2).join('|') : parts.slice(1).join('|');
      return { imdbId, title, isComingSoon };
    }
    return { imdbId: null, title: movieId, isComingSoon: false };
  };

  const { imdbId, title: movieTitle, isComingSoon } = parseMovieId();

  // Fetch movie details from IMDB
  useEffect(() => {
    if (imdbId) {
      setIsLoadingMovie(true);
      getIMDBMovie(imdbId)
        .then(data => {
          setMovie(data);
        })
        .finally(() => setIsLoadingMovie(false));
    } else {
      setIsLoadingMovie(false);
    }
  }, [imdbId]);

  const handleStartParty = async () => {
    if (isComingSoon) return; // Can't start party for coming soon movies

    setShowSourceModal(true);
    setIsLoadingSources(true);

    try {
      // Search for torrents using the movie title
      const searchTitle = movie?.title || movieTitle;
      const response = await searchAllSites(searchTitle, {
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
      // Pass movie runtime (in minutes) to WatchParty
      onSelectTorrent(source, movie?.runtime || undefined);
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

  const formatRuntime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  // Use IMDB data or fallbacks
  const displayTitle = movie?.title || movieTitle;
  const displayOverview = movie?.overview || 'No description available.';
  const displayYear = movie?.year || null;
  const displayRating = movie?.rating || null;
  const displayRuntime = movie?.runtime ? formatRuntime(movie.runtime) : null;
  const displayGenres = movie?.genres || [];
  const displayDirector = movie?.director || null;
  const displayPoster = movie?.poster || null;

  if (isLoadingMovie) {
    return (
      <div className="dark min-h-screen bg-background text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-gray-400">Loading movie details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-white flex flex-col">
      {/* Source Selection Modal */}
      {showSourceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1c1520] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white">Select Source</h3>
                <p className="text-sm text-gray-400 mt-1">Choose a stream quality for "{displayTitle}"</p>
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
          <button onClick={() => onNavigate('search')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-3 text-white cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onNavigate('home')}>
            <div className="w-6 h-6 text-primary">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-tight">CineParty</h2>
          </div>
        </div>
        <div className="flex flex-1 justify-end gap-6 items-center">
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
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: displayPoster ? `url(${displayPoster})` : 'url(https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1920&h=1080&fit=crop)' }}
          >
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
                  {movie?.contentRating && (
                    <span className="px-3 py-1 rounded bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-semibold uppercase tracking-wider text-white">{movie.contentRating}</span>
                  )}
                  {displayYear && (
                    <span className="px-3 py-1 rounded bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-semibold uppercase tracking-wider text-white">{displayYear}</span>
                  )}
                  {displayRuntime && (
                    <span className="px-3 py-1 rounded bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-semibold uppercase tracking-wider text-white">{displayRuntime}</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                    {displayTitle}
                  </h1>
                  {displayGenres.length > 0 && (
                    <div className="flex items-center gap-4 text-gray-400 text-lg font-medium mt-2">
                      {displayGenres.slice(0, 3).map((genre, i) => (
                        <span key={genre} className="flex items-center gap-4">
                          {i > 0 && <span className="w-1 h-1 bg-primary rounded-full"></span>}
                          <span>{genre}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mt-4">
                  {isComingSoon ? (
                    <div className="flex items-center gap-3 bg-yellow-500/20 text-yellow-400 px-8 py-4 rounded-lg font-bold text-lg border border-yellow-500/30">
                      <Calendar className="w-5 h-5" />
                      <span>Coming Soon</span>
                    </div>
                  ) : (
                    <button onClick={handleStartParty} className="flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-[0_0_20px_rgba(244,37,244,0.3)] hover:shadow-[0_0_30px_rgba(244,37,244,0.5)] transition-all transform hover:-translate-y-0.5 group">
                      <Play className="w-5 h-5 group-hover:animate-pulse fill-current" />
                      <span>Start Watch Party</span>
                    </button>
                  )}
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
              {displayRating && (
                <div className="hidden lg:flex flex-col justify-end items-end gap-4 pb-2">
                  <div className="flex items-end gap-3">
                    <span className="text-6xl font-bold text-white tracking-tighter">{displayRating.toFixed(1)}</span>
                    <div className="flex flex-col mb-2">
                      <div className="flex text-yellow-400 gap-1 text-xl">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`w-5 h-5 ${i <= Math.round(displayRating / 2) ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-400 font-medium">IMDB Rating</span>
                    </div>
                  </div>
                </div>
              )}
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
                  {displayOverview}
                </p>
              </section>

              {/* Cast */}
              {movie?.actors && movie.actors.length > 0 && (
                <section>
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    Cast
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {movie.actors.map((actor, index) => (
                      <span key={index} className="px-3 py-1.5 rounded-full bg-secondary border border-white/10 text-gray-300 text-sm">
                        {actor.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Content */}
            <div className="flex flex-col gap-8">
              {/* Info Card */}
              <div className="bg-secondary rounded-xl p-6 border border-white/5">
                <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Information</h4>
                <ul className="flex flex-col gap-4">
                  {displayDirector && (
                    <li className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-gray-400 text-sm">Director</span>
                      <span className="text-white font-medium text-right">{displayDirector}</span>
                    </li>
                  )}
                  {displayYear && (
                    <li className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-gray-400 text-sm">Year</span>
                      <span className="text-white font-medium text-right">{displayYear}</span>
                    </li>
                  )}
                  {displayRuntime && (
                    <li className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-gray-400 text-sm">Runtime</span>
                      <span className="text-white font-medium text-right">{displayRuntime}</span>
                    </li>
                  )}
                  {imdbId && (
                    <li className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">IMDB</span>
                      <a
                        href={`https://www.imdb.com/title/${imdbId}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-medium text-right hover:underline"
                      >
                        View on IMDB
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
