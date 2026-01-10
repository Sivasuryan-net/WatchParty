import { useState } from 'react';
import { Home } from './components/Home';
import { Search } from './components/Search';
import { MovieDetails } from './components/MovieDetails';
import { WatchParty } from './components/WatchParty';
import type { TorrentResult } from './types';

export type Page = 'home' | 'search' | 'details' | 'watch';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null);
  const [selectedTorrent, setSelectedTorrent] = useState<TorrentResult | null>(null);

  const handleNavigate = (page: Page, movieId?: string) => {
    setCurrentPage(page);
    if (movieId) {
      setSelectedMovie(movieId);
    }
  };

  const handleSelectTorrent = (torrent: TorrentResult) => {
    setSelectedTorrent(torrent);
  };

  return (
    <div className="dark min-h-screen bg-background font-['Spline_Sans',sans-serif]">
      {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
      {currentPage === 'search' && <Search onNavigate={handleNavigate} onSelectTorrent={handleSelectTorrent} />}
      {currentPage === 'details' && <MovieDetails onNavigate={handleNavigate} movieId={selectedMovie} onSelectTorrent={handleSelectTorrent} />}
      {currentPage === 'watch' && <WatchParty onNavigate={handleNavigate} movieId={selectedMovie} torrent={selectedTorrent} />}
    </div>
  );
}
