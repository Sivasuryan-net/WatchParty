/**
 * IMDB API Service - Frontend client for IMDB endpoints
 */

// Dynamic API URL that works in both Docker and dev
const getApiUrl = () => {
    if (typeof window !== 'undefined') {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        return `${protocol}//${hostname}:3001`;
    }
    return 'http://localhost:3001';
};

const API_URL = getApiUrl();

/**
 * Proxy image URL through backend to avoid COEP blocking
 */
export function proxyImageUrl(url: string | null): string | null {
    if (!url) return null;
    return `${API_URL}/api/proxy/image?url=${encodeURIComponent(url)}`;
}

export interface IMDBMovie {
    id: string;
    title: string;
    year: string | null;
    poster: string | null;
    rating?: number;
    comingSoon?: boolean;
    releaseDate?: string;
    type?: 'movie' | 'series';
}

export interface IMDBMovieDetails extends IMDBMovie {
    overview: string | null;
    runtime: number | null;
    genres: string[];
    director: string | null;
    contentRating: string | null;
    actors: { name: string; photo: string | null }[];
}

export interface IMDBSearchResponse {
    query: string;
    results: IMDBMovie[];
}

/**
 * Search movies on IMDB
 */
export async function searchIMDBMovies(query: string): Promise<IMDBSearchResponse> {
    try {
        const response = await fetch(
            `${API_URL}/api/imdb/search?q=${encodeURIComponent(query)}`
        );
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('IMDB search error:', error);
        return { query, results: [] };
    }
}

/**
 * Get movie details from IMDB
 */
export async function getIMDBMovie(id: string): Promise<IMDBMovieDetails | null> {
    try {
        const response = await fetch(`${API_URL}/api/imdb/movie/${id}`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('IMDB movie details error:', error);
        return null;
    }
}

/**
 * Get popular movies from IMDB
 */
export async function getPopularMovies(): Promise<IMDBMovie[]> {
    try {
        const response = await fetch(`${API_URL}/api/imdb/popular`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('IMDB popular error:', error);
        return [];
    }
}

/**
 * Get popular TV series from IMDB
 */
export async function getTVSeries(): Promise<IMDBMovie[]> {
    try {
        const response = await fetch(`${API_URL}/api/imdb/series`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('IMDB series error:', error);
        return [];
    }
}

/**
 * Get coming soon movies from IMDB
 */
export async function getComingSoon(): Promise<IMDBMovie[]> {
    try {
        const response = await fetch(`${API_URL}/api/imdb/coming-soon`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data.results.map((item: IMDBMovie & { comingSoon?: boolean }) => ({
            ...item,
            comingSoon: true
        }));
    } catch (error) {
        console.error('IMDB coming soon error:', error);
        return [];
    }
}

// ============ TV SERIES TYPES ============

export interface IMDBSeriesDetails {
    id: string;
    title: string;
    overview: string | null;
    poster: string | null;
    year: string | null;
    rating: number | null;
    genres: string[];
    actors: { name: string; photo: string | null }[];
    contentRating: string | null;
    type: 'series';
    numSeasons: number;
}

export interface IMDBEpisode {
    id: string;
    episode: number;
    title: string;
    overview: string | null;
    airDate: string | null;
    rating: number | null;
    thumbnail: string | null;
}

export interface IMDBSeasonResponse {
    season: number;
    episodes: IMDBEpisode[];
}

/**
 * Get TV series details from IMDB
 */
export async function getIMDBSeries(id: string): Promise<IMDBSeriesDetails | null> {
    try {
        const response = await fetch(`${API_URL}/api/imdb/tv/${id}`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('IMDB series details error:', error);
        return null;
    }
}

/**
 * Get episodes for a specific season of a TV series
 */
export async function getSeasonEpisodes(seriesId: string, season: number): Promise<IMDBSeasonResponse> {
    try {
        const response = await fetch(`${API_URL}/api/imdb/tv/${seriesId}/season/${season}`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('IMDB season episodes error:', error);
        return { season, episodes: [] };
    }
}

