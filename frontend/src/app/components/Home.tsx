import { Play, Plus, Info, Star, Users, ChevronLeft, ChevronRight, Bell, Settings, LogOut } from 'lucide-react';
import type { Page } from '../App';

interface HomeProps {
  onNavigate: (page: Page, movieId?: string) => void;
}

const trendingMovies = [
  { id: '1', title: 'The Batman', genre: 'Action', year: '2022', rating: '4.5', image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop' },
  { id: '2', title: 'Oppenheimer', genre: 'Drama', year: '2023', rating: '4.8', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop' },
  { id: '3', title: 'Spider-Verse', genre: 'Animation', year: '2023', rating: '4.9', image: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&h=600&fit=crop' },
  { id: '4', title: 'Interstellar', genre: 'Sci-Fi', year: '2014', rating: '4.7', image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=600&fit=crop' },
  { id: '5', title: 'Inception', genre: 'Sci-Fi', year: '2010', rating: '4.6', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop' },
  { id: '6', title: 'Blade Runner 2049', genre: 'Sci-Fi', year: '2017', rating: '4.3', image: 'https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=400&h=600&fit=crop' },
];

const liveParties = [
  { id: '1', title: 'The Matrix Marathon', host: 'NeoFan99', watching: 45, timeLeft: '1h 14m left', progress: 66, image: 'https://images.unsplash.com/photo-1574267432644-f610c7c8bb08?w=600&h=400&fit=crop' },
  { id: '2', title: 'Friday Horror Night', host: 'SpookyDave', watching: 14, timeLeft: 'Starting now', progress: 25, image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&h=400&fit=crop' },
  { id: '3', title: 'John Wick 4', host: 'ActionJunkie', watching: 10, timeLeft: '25m left', progress: 75, image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=400&fit=crop' },
];

const recommendedMovies = [
  { id: '7', title: 'Arrival', genre: 'Sci-Fi', year: '2016', rating: '8.9', image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=600&fit=crop' },
  { id: '8', title: 'Rogue One', genre: 'Action', year: '2016', rating: '8.7', image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop' },
  { id: '9', title: 'Mad Max: Fury Road', genre: 'Action', year: '2015', rating: '8.1', image: 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?w=400&h=600&fit=crop' },
  { id: '10', title: 'Foundation', genre: 'TV Series', year: '2021', rating: '7.9', image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop' },
  { id: '11', title: 'Gravity', genre: 'Sci-Fi', year: '2013', rating: '8.0', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop' },
];

export function Home({ onNavigate }: HomeProps) {
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
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span className="font-medium text-sm">Friends</span>
          </button>

          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">General</p>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Settings</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-sm">Help & Support</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button className="w-full flex items-center justify-center gap-2 rounded-lg h-12 bg-primary hover:bg-primary/90 transition-colors text-white font-bold shadow-[0_0_20px_rgba(244,37,244,0.4)] group">
            <Plus className="w-5 h-5 group-hover:animate-pulse" />
            <span>Start Party</span>
          </button>
          <div className="mt-4 flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border border-white/10"></div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Sarah Jenkins</span>
              <span className="text-xs text-gray-400">Online</span>
            </div>
            <button className="ml-auto text-gray-500 hover:text-white">
              <LogOut className="w-5 h-5" />
            </button>
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
            <button className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="relative w-full h-[70vh] min-h-[550px] max-h-[800px]">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          </div>

          <div className="relative h-full flex flex-col justify-end p-8 pb-16 md:p-16 max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded text-xs font-bold uppercase tracking-wider text-white border border-white/10">Featured</span>
              <span className="flex items-center gap-1 text-primary text-sm font-bold">
                <Star className="w-4 h-4 fill-current" /> 9.2
              </span>
              <span className="text-gray-300 text-sm">2024 • Sci-Fi • 2h 46m</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-white drop-shadow-2xl">
              Dune: Part Two
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed line-clamp-3">
              Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe...
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => onNavigate('details', 'dune')} className="h-12 px-8 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold flex items-center gap-2 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(244,37,244,0.3)]">
                <Play className="w-5 h-5 fill-current" />
                Watch Now
              </button>
              <button className="h-12 px-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold flex items-center gap-2 transition-transform hover:scale-105 border border-white/10">
                <Plus className="w-5 h-5" />
                Add to List
              </button>
              <button className="h-12 w-12 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors border border-white/10 ml-2">
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Rows */}
        <div className="relative z-10 pb-20 -mt-10 px-8 flex flex-col gap-12">
          {/* Trending Now */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full"></span>
                Trending Now
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
            <div className="flex overflow-x-auto gap-5 pb-6 pt-2 px-2 no-scrollbar snap-x">
              {trendingMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-[200px] group cursor-pointer snap-start" onClick={() => onNavigate('details', movie.id)}>
                  <div className="aspect-[2/3] rounded-lg bg-gray-800 bg-cover bg-center mb-3 relative overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(244,37,244,0.2)]" style={{ backgroundImage: `url(${movie.image})` }}>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-12 h-12 text-white drop-shadow-lg scale-50 group-hover:scale-100 transition-transform duration-300 fill-current" />
                    </div>
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-xs font-bold text-primary border border-white/10">{movie.rating} ★</div>
                  </div>
                  <h3 className="text-white font-medium truncate group-hover:text-primary transition-colors">{movie.title}</h3>
                  <p className="text-xs text-gray-400">{movie.genre} • {movie.year}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Live Parties */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-red-500 rounded-full animate-pulse"></span>
                Live Parties
              </h2>
              <a className="text-sm text-primary font-medium hover:text-white transition-colors cursor-pointer">View All</a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
              {liveParties.map((party) => (
                <div key={party.id} className="bg-card rounded-xl overflow-hidden hover:ring-2 hover:ring-primary transition-all group cursor-pointer border border-white/5" onClick={() => onNavigate('watch', party.id)}>
                  <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url(${party.image})` }}>
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                      <span className="w-2 h-2 bg-white rounded-full"></span> LIVE
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/90 to-transparent">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-blue-400 to-purple-500"></div>
                        <div className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-green-400 to-teal-500"></div>
                        <div className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-pink-400 to-red-500"></div>
                        <div className="w-8 h-8 rounded-full border-2 border-background bg-primary text-white text-[10px] font-bold flex items-center justify-center">+{party.watching - 3}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-1">{party.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">Hosted by <span className="text-white">{party.host}</span></p>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-primary" style={{ width: `${party.progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{party.timeLeft}</span>
                      <span>{party.watching} watching</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recommended */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full"></span>
                Because you watched <span className="text-primary italic">Dune</span>
              </h2>
            </div>
            <div className="flex overflow-x-auto gap-5 pb-6 pt-2 px-2 no-scrollbar snap-x">
              {recommendedMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-[200px] group cursor-pointer snap-start" onClick={() => onNavigate('details', movie.id)}>
                  <div className="aspect-[2/3] rounded-lg bg-gray-800 bg-cover bg-center mb-3 relative overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(244,37,244,0.2)]" style={{ backgroundImage: `url(${movie.image})` }}>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-12 h-12 text-white drop-shadow-lg scale-50 group-hover:scale-100 transition-transform duration-300 fill-current" />
                    </div>
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-xs font-bold text-primary border border-white/10">{movie.rating}</div>
                  </div>
                  <h3 className="text-white font-medium truncate group-hover:text-primary transition-colors">{movie.title}</h3>
                  <p className="text-xs text-gray-400">{movie.genre} • {movie.year}</p>
                </div>
              ))}
            </div>
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
