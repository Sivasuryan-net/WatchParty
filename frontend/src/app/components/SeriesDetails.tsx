import { Play, Plus, ThumbsUp, Share2, Bell, Star, ChevronRight, X, Loader2, HardDrive, Users as UsersIcon, ArrowLeft, ChevronDown, Tv } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Page } from '../App';
import type { TorrentResult } from '../types';
import { searchAllSites } from '../services/api';
import { getIMDBSeries, getSeasonEpisodes, type IMDBSeriesDetails, type IMDBEpisode } from '../services/imdb';

interface SeriesDetailsProps {
    onNavigate: (page: Page, movieId?: string) => void;
    seriesId: string | null;
    onSelectTorrent?: (torrent: TorrentResult) => void;
}

export function SeriesDetails({ onNavigate, seriesId, onSelectTorrent }: SeriesDetailsProps) {
    const [showSourceModal, setShowSourceModal] = useState(false);
    const [sources, setSources] = useState<TorrentResult[]>([]);
    const [isLoadingSources, setIsLoadingSources] = useState(false);
    const [series, setSeries] = useState<IMDBSeriesDetails | null>(null);
    const [isLoadingSeries, setIsLoadingSeries] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [episodes, setEpisodes] = useState<IMDBEpisode[]>([]);
    const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
    const [selectedEpisode, setSelectedEpisode] = useState<IMDBEpisode | null>(null);
    const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);

    // Parse seriesId which can be "imdbId|title" format
    const parseSeriesId = () => {
        if (!seriesId) return { imdbId: null, title: 'Unknown Series' };
        const parts = seriesId.split('|');
        if (parts.length >= 2) {
            return { imdbId: parts[0], title: parts.slice(1).join('|') };
        }
        return { imdbId: null, title: seriesId };
    };

    const { imdbId, title: seriesTitle } = parseSeriesId();

    // Fetch series details
    useEffect(() => {
        if (imdbId) {
            setIsLoadingSeries(true);
            getIMDBSeries(imdbId)
                .then(data => {
                    setSeries(data);
                })
                .finally(() => setIsLoadingSeries(false));
        } else {
            setIsLoadingSeries(false);
        }
    }, [imdbId]);

    // Fetch episodes when season changes
    useEffect(() => {
        if (imdbId && selectedSeason) {
            setIsLoadingEpisodes(true);
            getSeasonEpisodes(imdbId, selectedSeason)
                .then(data => {
                    setEpisodes(data.episodes);
                })
                .finally(() => setIsLoadingEpisodes(false));
        }
    }, [imdbId, selectedSeason]);

    const handleWatchEpisode = async (episode: IMDBEpisode) => {
        setSelectedEpisode(episode);
        setShowSourceModal(true);
        setIsLoadingSources(true);

        try {
            // Format search query with show name and S01E01 format
            const searchTitle = series?.title || seriesTitle;
            const episodeCode = `S${String(selectedSeason).padStart(2, '0')}E${String(episode.episode).padStart(2, '0')}`;
            const query = `${searchTitle} ${episodeCode}`;

            const response = await searchAllSites(query, {
                sortBy: 'seeders',
                limit: 15,
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
        onNavigate('watch', seriesId || undefined);
    };

    const getQualityBadge = (name: string) => {
        if (name.includes('2160p') || name.includes('4K')) return '4K';
        if (name.includes('1080p')) return '1080p';
        if (name.includes('720p')) return '720p';
        if (name.includes('480p')) return '480p';
        return null;
    };

    // Generate season numbers array
    const seasonNumbers = series?.numSeasons
        ? Array.from({ length: series.numSeasons }, (_, i) => i + 1)
        : [1];

    if (isLoadingSeries) {
        return (
            <div className="dark min-h-screen bg-background text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-gray-400">Loading series details...</p>
                </div>
            </div>
        );
    }

    const displayTitle = series?.title || seriesTitle;
    const displayOverview = series?.overview || 'No description available.';
    const displayPoster = series?.poster || null;

    return (
        <div className="dark min-h-screen bg-background text-white flex flex-col">
            {/* Source Selection Modal */}
            {showSourceModal && selectedEpisode && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1c1520] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-white/10 shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div>
                                <h3 className="text-xl font-bold text-white">Select Source</h3>
                                <p className="text-sm text-gray-400 mt-1">
                                    {displayTitle} - S{String(selectedSeason).padStart(2, '0')}E{String(selectedEpisode.episode).padStart(2, '0')}: {selectedEpisode.title}
                                </p>
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
                                    <p className="text-gray-400">Finding sources...</p>
                                </div>
                            ) : sources.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <p className="text-gray-400">No sources found for this episode</p>
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
                    <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                    <div className="flex items-center gap-3 text-white cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onNavigate('home')}>
                        <div className="w-6 h-6 text-primary">
                            <Tv className="w-full h-full" />
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-tight">CineParty</h2>
                    </div>
                </div>
                <div className="flex flex-1 justify-end gap-6 items-center">
                    <div className="flex items-center gap-3">
                        <button className="relative bg-secondary p-2 rounded-full hover:bg-accent transition-colors">
                            <Bell className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex flex-col w-full">
                {/* Hero Section */}
                <div className="relative w-full min-h-[50vh] flex flex-col justify-end pb-8 lg:pb-12">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: displayPoster ? `url(${displayPoster})` : 'url(https://images.unsplash.com/photo-1574267432644-f610c7c8bb08?w=1920&h=1080&fit=crop)' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#181118] via-[#181118]/80 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#181118]/90 via-transparent to-transparent"></div>
                    </div>

                    {/* Hero Content */}
                    <div className="px-6 lg:px-20 relative z-10 w-full">
                        <div className="max-w-[1200px] flex flex-col gap-4">
                            {/* Badge */}
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center gap-1">
                                    <Tv className="w-3 h-3" />
                                    TV Series
                                </span>
                                {series?.rating && (
                                    <span className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                                        <Star className="w-4 h-4 fill-current" /> {series.rating.toFixed(1)}
                                    </span>
                                )}
                                {series?.year && (
                                    <span className="text-gray-400 text-sm">{series.year}</span>
                                )}
                                {series?.numSeasons && (
                                    <span className="text-gray-400 text-sm">{series.numSeasons} Season{series.numSeasons > 1 ? 's' : ''}</span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                                {displayTitle}
                            </h1>

                            {series?.genres && series.genres.length > 0 && (
                                <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
                                    {series.genres.slice(0, 4).map((genre, i) => (
                                        <span key={genre} className="flex items-center gap-3">
                                            {i > 0 && <span className="w-1 h-1 bg-primary rounded-full"></span>}
                                            <span>{genre}</span>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className="text-gray-300 text-lg max-w-3xl line-clamp-3">{displayOverview}</p>
                        </div>
                    </div>
                </div>

                {/* Episodes Section */}
                <div className="px-6 lg:px-20 py-8 bg-[#181118]">
                    <div className="max-w-[1200px]">
                        {/* Season Selector */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-primary rounded-full"></span>
                                Episodes
                            </h3>

                            {/* Season Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
                                    className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg border border-white/10 hover:border-primary/30 transition-colors text-white font-medium"
                                >
                                    Season {selectedSeason}
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showSeasonDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showSeasonDropdown && (
                                    <div className="absolute right-0 top-full mt-2 w-40 bg-secondary rounded-lg border border-white/10 shadow-xl z-50 overflow-hidden">
                                        {seasonNumbers.map(num => (
                                            <button
                                                key={num}
                                                onClick={() => {
                                                    setSelectedSeason(num);
                                                    setShowSeasonDropdown(false);
                                                }}
                                                className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors ${selectedSeason === num ? 'bg-primary/20 text-primary' : 'text-white'
                                                    }`}
                                            >
                                                Season {num}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Episodes Grid */}
                        {isLoadingEpisodes ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        ) : episodes.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                No episodes found for this season
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {episodes.map(episode => (
                                    <div
                                        key={episode.id}
                                        onClick={() => handleWatchEpisode(episode)}
                                        className="group cursor-pointer bg-secondary/50 rounded-xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all hover:shadow-[0_0_20px_rgba(244,37,244,0.15)]"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative aspect-video bg-gray-800">
                                            {episode.thumbnail ? (
                                                <img src={episode.thumbnail} alt={episode.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-900/20">
                                                    <Play className="w-10 h-10 text-primary/50" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                                                    <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                                                </div>
                                            </div>
                                            {/* Episode Number Badge */}
                                            <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 text-white text-xs font-bold">
                                                E{episode.episode}
                                            </div>
                                            {/* Rating Badge */}
                                            {episode.rating && (
                                                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-black/70">
                                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                    <span className="text-xs font-bold text-white">{episode.rating.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                        {/* Info */}
                                        <div className="p-4">
                                            <h4 className="text-white font-medium text-sm truncate group-hover:text-primary transition-colors">
                                                {episode.title}
                                            </h4>
                                            {episode.airDate && (
                                                <p className="text-gray-500 text-xs mt-1">{new Date(episode.airDate).toLocaleDateString()}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
