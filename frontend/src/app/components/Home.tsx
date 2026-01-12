import { Play, Plus, Info, Star, Users, ChevronLeft, ChevronRight, Bell, Settings, LogOut, Loader2, Calendar, Tv, Film } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Page } from '../App';
import { getPopularMovies, getTVSeries, getComingSoon, proxyImageUrl, type IMDBMovie } from '../services/imdb';
import { useAuth } from '../context/AuthContext';

interface HomeProps {
  onNavigate: (page: Page, movieId?: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const { user, logout } = useAuth();
  const [movies, setMovies] = useState<IMDBMovie[]>([]);
  const [series, setSeries] = useState<IMDBMovie[]>([]);
  const [comingSoon, setComingSoon] = useState<IMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredMovie, setFeaturedMovie] = useState<IMDBMovie | null>(null);

  // Load all content on mount
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getPopularMovies(),
      getTVSeries(),
      getComingSoon()
    ]).then(([moviesData, seriesData, comingSoonData]) => {
      setMovies(moviesData);
      setSeries(seriesData);
      setComingSoon(comingSoonData);
      if (moviesData.length > 0) {
        setFeaturedMovie(moviesData[0]);
      }
    }).finally(() => setIsLoading(false));
  }, []);

  const handleMovieClick = (movie: IMDBMovie) => {
    const prefix = movie.comingSoon ? 'coming|' : '';
    // Navigate to series page for TV shows, details page for movies
    if (movie.type === 'series') {
      onNavigate('series', `${movie.id}|${movie.title}`);
    } else {
      onNavigate('details', `${movie.id}|${prefix}${movie.title}`);
    }
  };

  const MovieCard = ({ movie, showComingSoon = false }: { movie: IMDBMovie; showComingSoon?: boolean }) => (
    <div className="flex-none w-[200px] group cursor-pointer snap-start" onClick={() => handleMovieClick(movie)}>
      <div
        className="aspect-[2/3] rounded-lg bg-gray-800 bg-cover bg-center mb-3 relative overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(244,37,244,0.2)]"
        style={{ backgroundImage: movie.poster ? `url(${proxyImageUrl(movie.poster)})` : 'none' }}
      >
        {!movie.poster && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-8 h-8 text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-12 h-12 text-white drop-shadow-lg scale-50 group-hover:scale-100 transition-transform duration-300 fill-current" />
        </div>
        {showComingSoon && movie.releaseDate && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded bg-primary/90 text-white text-xs font-bold flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        )}
        {!showComingSoon && movie.rating && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-xs font-bold text-primary border border-white/10">
            {movie.rating.toFixed(1)} ★
          </div>
        )}
        {movie.type === 'series' && (
          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-blue-500/80 text-white text-xs font-bold">
            TV Series
          </div>
        )}
      </div>
      <h3 className="text-white font-medium truncate group-hover:text-primary transition-colors">{movie.title}</h3>
      {movie.year && (
        <p className="text-xs text-gray-400">{movie.year}</p>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#181118] h-full">
        <div className="p-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center shadow-[0_0_15px_rgba(244,37,244,0.3)]">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">CineParty</h1>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-2">Menu</p>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary border-l-4 border-primary">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="font-medium text-sm">Home</span>
          </button>
          <button onClick={() => onNavigate('search')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="font-medium text-sm">Search</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Users className="w-5 h-5" />
            <span className="font-medium text-sm">Your Parties</span>
          </button>

          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">General</p>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={() => onNavigate('search')} className="w-full flex items-center justify-center gap-2 rounded-lg h-12 bg-primary hover:bg-primary/90 transition-colors text-white font-bold shadow-[0_0_20px_rgba(244,37,244,0.4)] group">
            <Plus className="w-5 h-5 group-hover:animate-pulse" />
            <span>Start Party</span>
          </button>

          <div className="mt-4 flex items-center gap-3 px-2">
            {user ? (
              <>
                <div className="h-10 w-10 rounded-full bg-cover bg-center border border-white/10" style={{ backgroundImage: `url(${user.avatar})` }}></div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{user.username}</span>
                  <span className="text-xs text-gray-400">Online</span>
                </div>
                <button onClick={logout} className="ml-auto text-gray-500 hover:text-white" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="w-full">
                <button onClick={() => onNavigate('login')} className="w-full flex items-center justify-center gap-2 rounded-lg h-10 bg-white/10 hover:bg-white/20 transition-colors text-white font-medium">
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-background relative">
        {/* Header */}
        <header className="absolute top-0 left-0 w-full z-10 p-6 flex justify-between items-start pointer-events-none">
          <div className="pointer-events-auto"></div>
          <div className="flex gap-4 pointer-events-auto">
            <button className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="relative w-full h-[70vh] min-h-[550px] max-h-[800px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
          ) : featuredMovie ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: featuredMovie.poster ? `url(${featuredMovie.poster})` : 'url(https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
              </div>

              <div className="relative h-full flex flex-col justify-end p-8 pb-16 md:p-16 max-w-4xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded text-xs font-bold uppercase tracking-wider text-white border border-white/10">Featured</span>
                  {featuredMovie.rating && (
                    <span className="flex items-center gap-1 text-primary text-sm font-bold">
                      <Star className="w-4 h-4 fill-current" /> {featuredMovie.rating.toFixed(1)}
                    </span>
                  )}
                  {featuredMovie.year && (
                    <span className="text-gray-300 text-sm">{featuredMovie.year}</span>
                  )}
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-white drop-shadow-2xl">
                  {featuredMovie.title}
                </h1>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => handleMovieClick(featuredMovie)} className="h-12 px-8 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold flex items-center gap-2 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(244,37,244,0.3)]">
                    <Play className="w-5 h-5 fill-current" />
                    Watch Now
                  </button>
                  <button onClick={() => handleMovieClick(featuredMovie)} className="h-12 w-12 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors border border-white/10">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Content Rows */}
        <div className="relative z-10 pb-20 -mt-10 px-8 flex flex-col gap-12">
          {/* Movies Section */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Film className="w-6 h-6 text-primary" />
                Popular Movies
              </h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="flex overflow-x-auto gap-5 pb-6 pt-2 px-2 no-scrollbar snap-x">
                {movies.slice(1, 12).map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}
          </section>

          {/* TV Series Section */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Tv className="w-6 h-6 text-blue-400" />
                Popular TV Series
              </h2>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="flex overflow-x-auto gap-5 pb-6 pt-2 px-2 no-scrollbar snap-x">
                {series.slice(0, 12).map((show) => (
                  <MovieCard key={show.id} movie={{ ...show, type: 'series' }} />
                ))}
              </div>
            )}
          </section>

          {/* Coming Soon Section */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-yellow-400" />
                Coming Soon
              </h2>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : comingSoon.length > 0 ? (
              <div className="flex overflow-x-auto gap-5 pb-6 pt-2 px-2 no-scrollbar snap-x">
                {comingSoon.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} showComingSoon />
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No upcoming releases found</div>
            )}
          </section>
        </div>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
