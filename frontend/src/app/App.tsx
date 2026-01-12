import { useState } from 'react';
import { Home } from './components/Home';
import { Search } from './components/Search';
import { MovieDetails } from './components/MovieDetails';
import { SeriesDetails } from './components/SeriesDetails';
import { WatchParty } from './components/WatchParty';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { TorrentResult } from './types';

export type Page = 'home' | 'search' | 'details' | 'series' | 'watch' | 'login' | 'register';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null);
  const [selectedTorrent, setSelectedTorrent] = useState<TorrentResult | null>(null);
  const [movieRuntime, setMovieRuntime] = useState<number | null>(null);
  const { user, isLoading } = useAuth();

  const handleNavigate = (page: Page, movieId?: string) => {
    setCurrentPage(page);
    if (movieId) {
      setSelectedMovie(movieId);
    }
  };

  const handleSelectTorrent = (torrent: TorrentResult, runtime?: number) => {
    setSelectedTorrent(torrent);
    if (runtime) {
      setMovieRuntime(runtime);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="dark min-h-screen bg-background font-['Spline_Sans',sans-serif]">
      {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
      {currentPage === 'search' && <Search onNavigate={handleNavigate} />}
      {currentPage === 'details' && <MovieDetails onNavigate={handleNavigate} movieId={selectedMovie} onSelectTorrent={handleSelectTorrent} />}
      {currentPage === 'series' && <SeriesDetails onNavigate={handleNavigate} seriesId={selectedMovie} onSelectTorrent={handleSelectTorrent} />}
      {currentPage === 'watch' && <WatchParty onNavigate={handleNavigate} movieId={selectedMovie} torrent={selectedTorrent} movieRuntime={movieRuntime} />}
      {currentPage === 'login' && <Login onNavigate={handleNavigate} />}
      {currentPage === 'register' && <Register onNavigate={handleNavigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
