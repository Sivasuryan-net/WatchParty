import type { TorrentSearchResponse, SitesResponse } from '../types';

// Dynamic API URL that works in both Docker and dev environments
// In Docker: frontend on :3000, backend on :3001, same hostname
// In dev: frontend on :5173, backend on :3001, both localhost
const TORRENTS_API_URL = (() => {
    if (typeof window !== 'undefined') {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        return `${protocol}//${hostname}:3001`;
    }
    return 'http://localhost:3001'; // SSR fallback
})();

interface SearchOptions {
    quality?: string;
    sortBy?: 'seeders' | 'leechers' | 'size' | 'date';
    order?: 'asc' | 'desc';
    limit?: number;
    page?: number;
}

/**
 * Search all torrent sites
 */
export async function searchAllSites(
    query: string,
    options: SearchOptions = {}
): Promise<TorrentSearchResponse> {
    const { quality, sortBy = 'seeders', order = 'desc', limit = 20, page = 1 } = options;

    const params = new URLSearchParams({
        sortBy,
        order,
        limit: limit.toString(),
    });

    if (quality) params.append('quality', quality);

    const url = `${TORRENTS_API_URL}/api/all/${encodeURIComponent(query)}/${page}?${params}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Search error:', error);
        return { query, page, total: 0, results: [] };
    }
}

/**
 * Search a specific torrent site
 */
export async function searchSite(
    site: string,
    query: string,
    options: SearchOptions = {}
): Promise<TorrentSearchResponse> {
    const { quality, sortBy = 'seeders', order = 'desc', limit = 20, page = 1 } = options;

    const params = new URLSearchParams({
        sortBy,
        order,
        limit: limit.toString(),
    });

    if (quality) params.append('quality', quality);

    const url = `${TORRENTS_API_URL}/api/${site}/${encodeURIComponent(query)}/${page}?${params}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Search ${site} error:`, error);
        return { site, query, page, total: 0, results: [] };
    }
}

/**
 * Get list of available torrent sites
 */
export async function getSites(): Promise<SitesResponse> {
    try {
        const response = await fetch(`${TORRENTS_API_URL}/api/sites`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Get sites error:', error);
        return { count: 0, sites: [] };
    }
}

/**
 * Search for movies (for content discovery)
 */
export async function searchMovies(query: string, limit = 10) {
    // Search multiple sites and aggregate results
    const response = await searchAllSites(query, {
        sortBy: 'seeders',
        limit,
    });

    // Filter to likely movie content (has seeders, reasonable size)
    return response.results.filter(r =>
        parseInt(r.Seeders) > 0 &&
        r.Magnet
    );
}

/**
 * Get best source for a movie
 */
export async function getBestSource(movieTitle: string) {
    const results = await searchAllSites(movieTitle, {
        sortBy: 'seeders',
        limit: 1,
        quality: '1080p',
    });

    return results.results[0] || null;
}

export const auth = {
    register: async (userData: any) => {
        const response = await fetch(`${TORRENTS_API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }
        return response.json();
    },

    login: async (credentials: any) => {
        const response = await fetch(`${TORRENTS_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }
        return response.json();
    },

    getMe: async (token: string) => {
        const response = await fetch(`${TORRENTS_API_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to get user');
        return response.json();
    }
};
