import { Search as SearchIcon, X, Clock, Home, Users, Bookmark, User, Loader2, Star, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Page } from '../App';
import { searchIMDBMovies, getPopularMovies, proxyImageUrl, type IMDBMovie } from '../services/imdb';

interface SearchProps {
  onNavigate: (page: Page, movieId?: string) => void;
}

export function Search({ onNavigate }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IMDBMovie[]>([]);
  const [popular, setPopular] = useState<IMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load popular movies on mount
  useEffect(() => {
    getPopularMovies().then(setPopular);
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await searchIMDBMovies(query);
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

  const handleMovieClick = (movie: IMDBMovie) => {
    // Navigate to series page for TV shows, details page for movies
    if (movie.type === 'series') {
      onNavigate('series', `${movie.id}|${movie.title}`);
    } else {
      onNavigate('details', `${movie.id}|${movie.title}`);
    }
  };

  const MovieCard = ({ movie }: { movie: IMDBMovie }) => (
    <div
      onClick={() => handleMovieClick(movie)}
      className="group cursor-pointer rounded-xl overflow-hidden bg-secondary/50 hover:bg-secondary border border-white/5 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(244,37,244,0.15)] hover:-translate-y-1"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {movie.poster ? (
          <img
            src={proxyImageUrl(movie.poster) || ''}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-purple-900/30 flex items-center justify-center">
            <Play className="w-12 h-12 text-primary/60" />
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <button className="px-4 py-2 rounded-lg bg-primary text-white font-medium flex items-center gap-2 shadow-lg">
            <Play className="w-4 h-4 fill-current" />
            Watch
          </button>
        </div>
        {/* Rating badge */}
        {movie.rating && movie.rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs font-bold text-white">{movie.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-3">
        <h4 className="text-white font-medium text-sm truncate group-hover:text-primary transition-colors">
          {movie.title}
        </h4>
        {movie.year && (
          <p className="text-gray-500 text-xs mt-1">{movie.year}</p>
        )}
      </div>
    </div>
  );

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
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-background">
        {/* Cinematic Background Glow */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background/50 to-transparent pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:px-12 md:py-14 flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-lg">What are we watching tonight?</h2>
            <p className="text-gray-400 text-lg">Search movies and start a watch party with friends.</p>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-4xl">
            <label className="group relative flex items-center w-full h-16 rounded-2xl bg-secondary/80 backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary focus-within:shadow-[0_0_20px_rgba(244,37,244,0.25)]">
              <div className="pl-6 pr-4 text-gray-400 group-focus-within:text-primary transition-colors">
                <SearchIcon className="w-7 h-7" />
              </div>
              <input
                className="w-full h-full bg-transparent border-none text-white text-xl placeholder-gray-500 focus:ring-0 focus:outline-none"
                placeholder="Search movies..."
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

          {/* Results */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-gray-400">Searching movies...</p>
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <SearchIcon className="w-16 h-16 text-gray-600" />
              <p className="text-gray-400 text-lg">No movies found for "{query}"</p>
              <p className="text-gray-500 text-sm">Try a different search term</p>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{results.length} Movies Found</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Recent Searches */}
              <div className="flex flex-col gap-4 py-4 border-b border-white/5 pb-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Recent Searches</h3>
                <div className="flex flex-wrap gap-4">
                  {['Interstellar', 'The Dark Knight', 'Inception'].map((term) => (
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

              {/* Popular Section */}
              {popular.length > 0 && (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-end">
                    <h3 className="text-xl font-bold text-white">Popular Movies</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {popular.slice(0, 12).map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
