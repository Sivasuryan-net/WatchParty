/**
 * IMDB API Routes - Movie metadata from IMDB (no API key required)
 * Uses IMDB's suggestion API for search and scrapes individual movie pages for details
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

// IMDB endpoints
const IMDB_SUGGESTION_URL = 'https://v3.sg.media-imdb.com/suggestion';
const IMDB_BASE_URL = 'https://www.imdb.com';

/**
 * Search movies on IMDB
 * GET /api/imdb/search?q=query
 */
router.get('/search', async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        // IMDB's suggestion API uses the first letter as a path segment
        const firstChar = q.charAt(0).toLowerCase();
        const response = await axios.get(`${IMDB_SUGGESTION_URL}/${firstChar}/${encodeURIComponent(q)}.json`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Filter to movies and TV series
        const results = (response.data.d || [])
            .filter(item => item.qid === 'movie' || item.qid === 'feature' || item.qid === 'tvSeries')
            .map(item => ({
                id: item.id,
                title: item.l,
                year: item.y || null,
                poster: item.i?.imageUrl || null,
                actors: item.s || null,
                rank: item.rank || null,
                type: item.qid === 'tvSeries' ? 'series' : 'movie'
            }));

        res.json({
            query: q,
            results: results
        });
    } catch (error) {
        console.error('[IMDB] Search error:', error.message);
        res.status(500).json({ error: 'Failed to search movies' });
    }
});

/**
 * Get movie details from IMDB
 * Uses web scraping to get additional details
 * GET /api/imdb/movie/:id
 */
router.get('/movie/:id', async (req, res) => {
    const { id } = req.params;

    if (!id.startsWith('tt')) {
        return res.status(400).json({ error: 'Invalid IMDB ID format' });
    }

    try {
        // Fetch the movie page
        const response = await axios.get(`${IMDB_BASE_URL}/title/${id}/`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        const html = response.data;

        // Extract JSON-LD data (contains structured movie info)
        const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
        let movieData = {};

        if (jsonLdMatch) {
            try {
                movieData = JSON.parse(jsonLdMatch[1]);
            } catch (e) {
                console.log('[IMDB] Failed to parse JSON-LD');
            }
        }

        // Extract rating
        const ratingMatch = html.match(/aggregateRating.*?"ratingValue":\s*"?([0-9.]+)"?/);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

        // Extract year
        const yearMatch = html.match(/releaseDate.*?(\d{4})/);
        const year = yearMatch ? yearMatch[1] : null;

        // Extract runtime 
        const runtimeMatch = html.match(/"duration":\s*"PT(\d+)H?(\d*)M?"/);
        let runtime = null;
        if (runtimeMatch) {
            const hours = parseInt(runtimeMatch[1]) || 0;
            const minutes = parseInt(runtimeMatch[2]) || 0;
            runtime = hours * 60 + minutes;
        }

        // Build response
        res.json({
            id: id,
            title: movieData.name || null,
            overview: movieData.description || null,
            poster: movieData.image || null,
            year: year,
            rating: rating,
            runtime: runtime,
            genres: movieData.genre || [],
            director: movieData.director?.[0]?.name || movieData.director?.name || null,
            actors: (movieData.actor || []).slice(0, 10).map(a => ({
                name: a.name,
                photo: null
            })),
            contentRating: movieData.contentRating || null
        });
    } catch (error) {
        console.error('[IMDB] Movie details error:', error.message);
        res.status(500).json({ error: 'Failed to get movie details' });
    }
});

/**
 * Get TV series details with seasons and episodes
 * GET /api/imdb/tv/:id
 */
router.get('/tv/:id', async (req, res) => {
    const { id } = req.params;

    if (!id.startsWith('tt')) {
        return res.status(400).json({ error: 'Invalid IMDB ID format' });
    }

    try {
        // Fetch the series page
        const response = await axios.get(`${IMDB_BASE_URL}/title/${id}/`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        const html = response.data;

        // Extract JSON-LD data
        const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
        let seriesData = {};

        if (jsonLdMatch) {
            try {
                seriesData = JSON.parse(jsonLdMatch[1]);
            } catch (e) {
                console.log('[IMDB] Failed to parse JSON-LD');
            }
        }

        // Extract rating
        const ratingMatch = html.match(/aggregateRating.*?"ratingValue":\s*"?([0-9.]+)"?/);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

        // Extract year range
        const yearMatch = html.match(/releaseDate.*?(\d{4})/);
        const year = yearMatch ? yearMatch[1] : null;

        // Try to get number of seasons from the page
        const seasonsMatch = html.match(/(\d+)\s*Season/i);
        const numSeasons = seasonsMatch ? parseInt(seasonsMatch[1]) : 1;

        // Return series info
        res.json({
            id: id,
            title: seriesData.name || null,
            overview: seriesData.description || null,
            poster: seriesData.image || null,
            year: year,
            rating: rating,
            genres: seriesData.genre || [],
            actors: (seriesData.actor || []).slice(0, 10).map(a => ({
                name: a.name,
                photo: null
            })),
            contentRating: seriesData.contentRating || null,
            type: 'series',
            numSeasons: numSeasons
        });
    } catch (error) {
        console.error('[IMDB] TV series details error:', error.message);
        res.status(500).json({ error: 'Failed to get TV series details' });
    }
});

/**
 * Get episodes for a specific season of a TV series
 * GET /api/imdb/tv/:id/season/:season
 */
router.get('/tv/:id/season/:season', async (req, res) => {
    const { id, season } = req.params;

    if (!id.startsWith('tt')) {
        return res.status(400).json({ error: 'Invalid IMDB ID format' });
    }

    try {
        // Fetch the season episodes page
        const response = await axios.get(`${IMDB_BASE_URL}/title/${id}/episodes/?season=${season}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        const html = response.data;

        // Extract JSON data from Next.js page
        const scriptMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);

        if (!scriptMatch) {
            return res.json({ season: parseInt(season), episodes: [] });
        }

        const nextData = JSON.parse(scriptMatch[1]);
        const episodesData = nextData?.props?.pageProps?.contentData?.section?.episodes?.items || [];

        const episodes = episodesData.map((ep, index) => ({
            id: ep.id,
            episode: ep.episode || index + 1,
            title: ep.titleText || `Episode ${ep.episode || index + 1}`,
            overview: ep.plot || null,
            airDate: ep.releaseDate ? `${ep.releaseDate.year}-${String(ep.releaseDate.month || 1).padStart(2, '0')}-${String(ep.releaseDate.day || 1).padStart(2, '0')}` : null,
            rating: ep.aggregateRating || null,
            thumbnail: ep.image?.url || null
        }));

        res.json({
            season: parseInt(season),
            episodes: episodes
        });
    } catch (error) {
        console.error('[IMDB] Season episodes error:', error.message);
        res.status(500).json({ error: 'Failed to get episodes' });
    }
});

/**
 * Get popular/trending movies
 * GET /api/imdb/popular
 */
router.get('/popular', async (req, res) => {
    try {
        // Scrape IMDB's most popular movies chart
        const response = await axios.get(`${IMDB_BASE_URL}/chart/moviemeter/`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        const html = response.data;

        // Extract JSON data from the page
        const scriptMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);

        if (!scriptMatch) {
            return res.json({ results: [] });
        }

        const nextData = JSON.parse(scriptMatch[1]);
        const edges = nextData?.props?.pageProps?.pageData?.chartTitles?.edges || [];
        const currentYear = new Date().getFullYear();

        const movies = edges
            .map(edge => {
                const node = edge.node;
                return {
                    id: node.id,
                    title: node.titleText?.text || null,
                    year: node.releaseYear?.year || null,
                    poster: node.primaryImage?.url || null,
                    rating: node.ratingsSummary?.aggregateRating || null
                };
            })
            // Filter out unreleased movies (no rating or year > current year)
            .filter(movie => movie.rating && movie.year && movie.year <= currentYear)
            .slice(0, 20);

        res.json({ results: movies });
    } catch (error) {
        console.error('[IMDB] Popular movies error:', error.message);
        res.status(500).json({ error: 'Failed to get popular movies' });
    }
});

/**
 * Get popular TV series
 * GET /api/imdb/series
 */
router.get('/series', async (req, res) => {
    try {
        // Use the suggestion API to get popular TV shows by searching common terms
        const popularShows = ['breaking bad', 'game of thrones', 'stranger things', 'the mandalorian',
            'wednesday', 'the last of us', 'house of the dragon', 'squid game',
            'peaky blinders', 'better call saul', 'dark', 'money heist'];

        const results = [];

        // Fetch a few popular shows using the suggestion API
        for (const show of popularShows.slice(0, 6)) {
            try {
                const firstChar = show.charAt(0).toLowerCase();
                const response = await axios.get(`${IMDB_SUGGESTION_URL}/${firstChar}/${encodeURIComponent(show)}.json`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });

                const items = (response.data.d || []).filter(item => item.qid === 'tvSeries');
                if (items.length > 0) {
                    const item = items[0];
                    results.push({
                        id: item.id,
                        title: item.l,
                        year: item.y || null,
                        poster: item.i?.imageUrl || null,
                        rating: null,
                        type: 'series'
                    });
                }
            } catch (e) {
                // Skip failed requests
            }
        }

        res.json({ results });
    } catch (error) {
        console.error('[IMDB] TV series error:', error.message);
        res.status(500).json({ error: 'Failed to get TV series' });
    }
});

/**
 * Get coming soon movies
 * GET /api/imdb/coming-soon
 */
router.get('/coming-soon', async (req, res) => {
    try {
        // Use the suggestion API with upcoming/anticipated movie titles
        const upcomingMovies = ['dune 3', 'avatar 3', 'avengers secret wars', 'deadpool 4',
            'mission impossible 8', 'jurassic world 4', 'the batman 2',
            'spider-man 4', 'guardians of the galaxy 4', 'fast x 2'];

        const results = [];

        for (const movie of upcomingMovies.slice(0, 8)) {
            try {
                const firstChar = movie.charAt(0).toLowerCase();
                const response = await axios.get(`${IMDB_SUGGESTION_URL}/${firstChar}/${encodeURIComponent(movie)}.json`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });

                const items = (response.data.d || []).filter(item =>
                    item.qid === 'movie' || item.qid === 'feature'
                );
                if (items.length > 0) {
                    const item = items[0];
                    // Only include if it looks like an upcoming film (year >= current year)
                    const currentYear = new Date().getFullYear();
                    if (!item.y || item.y >= currentYear) {
                        results.push({
                            id: item.id,
                            title: item.l,
                            year: item.y || currentYear + 1,
                            poster: item.i?.imageUrl || null,
                            rating: null,
                            comingSoon: true,
                            type: 'movie'
                        });
                    }
                }
            } catch (e) {
                // Skip failed requests
            }
        }

        res.json({ results });
    } catch (error) {
        console.error('[IMDB] Coming soon error:', error.message);
        res.status(500).json({ error: 'Failed to get coming soon' });
    }
});

module.exports = router;
