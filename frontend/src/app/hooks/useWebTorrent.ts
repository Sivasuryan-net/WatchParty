import { useState, useEffect, useRef, useCallback } from 'react';

// WebTorrent types
interface TorrentFile {
    name: string;
    length: number;
    path: string;
}

interface Torrent {
    infoHash: string;
    name: string;
    files: TorrentFile[];
    progress: number;
    downloadSpeed: number;
    uploadSpeed: number;
    numPeers: number;
    done: boolean;
    destroy: () => void;
    on: (event: string, callback: (...args: any[]) => void) => void;
}

interface WebTorrentClient {
    add: (magnetUri: string, opts?: any, callback?: (torrent: Torrent) => void) => Torrent;
    destroy: () => void;
    torrents: Torrent[];
}

declare global {
    interface Window {
        WebTorrent: new () => WebTorrentClient;
    }
}

interface UseWebTorrentOptions {
    autoPlay?: boolean;
}

interface WebTorrentState {
    isLoading: boolean;
    isReady: boolean;
    error: string | null;
    progress: number; // 0-100
    downloadSpeed: number; // bytes/s
    uploadSpeed: number; // bytes/s
    peers: number;
    torrentName: string | null;
    videoUrl: string | null;
}

/**
 * Hook to stream video from magnet links using WebTorrent
 */
export function useWebTorrent(magnetUri: string | null, options: UseWebTorrentOptions = {}) {
    const { autoPlay = true } = options;
    const clientRef = useRef<WebTorrentClient | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const [state, setState] = useState<WebTorrentState>({
        isLoading: false,
        isReady: false,
        error: null,
        progress: 0,
        downloadSpeed: 0,
        uploadSpeed: 0,
        peers: 0,
        torrentName: null,
        videoUrl: null,
    });

    // Load WebTorrent script
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.WebTorrent) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    // Start torrent when magnet changes
    useEffect(() => {
        if (!magnetUri) return;

        const startTorrent = async () => {
            // Wait for WebTorrent to load
            let attempts = 0;
            while (!window.WebTorrent && attempts < 50) {
                await new Promise(r => setTimeout(r, 100));
                attempts++;
            }

            if (!window.WebTorrent) {
                setState(s => ({ ...s, error: 'WebTorrent failed to load' }));
                return;
            }

            // Cleanup previous client
            if (clientRef.current) {
                clientRef.current.destroy();
            }

            setState(s => ({ ...s, isLoading: true, error: null, progress: 0 }));

            try {
                const client = new window.WebTorrent();
                clientRef.current = client;

                const torrent = client.add(magnetUri, {
                    announce: [
                        'wss://tracker.openwebtorrent.com',
                        'wss://tracker.btorrent.xyz',
                        'wss://tracker.fastcast.nz'
                    ]
                });

                torrent.on('ready', () => {
                    console.log('Torrent ready:', torrent.name);

                    // Find video file
                    const videoFile = torrent.files.find((file: TorrentFile) =>
                        /\.(mp4|mkv|avi|webm|mov)$/i.test(file.name)
                    );

                    if (!videoFile) {
                        setState(s => ({ ...s, isLoading: false, error: 'No video file found in torrent' }));
                        return;
                    }

                    // Create blob URL for video
                    (videoFile as any).getBlobURL((err: Error | null, url: string) => {
                        if (err) {
                            setState(s => ({ ...s, isLoading: false, error: err.message }));
                            return;
                        }

                        setState(s => ({
                            ...s,
                            isLoading: false,
                            isReady: true,
                            torrentName: torrent.name,
                            videoUrl: url,
                        }));
                    });
                });

                // Progress updates
                const updateProgress = () => {
                    setState(s => ({
                        ...s,
                        progress: Math.round(torrent.progress * 100),
                        downloadSpeed: torrent.downloadSpeed,
                        uploadSpeed: torrent.uploadSpeed,
                        peers: torrent.numPeers,
                    }));
                };

                torrent.on('download', updateProgress);
                torrent.on('upload', updateProgress);

                torrent.on('error', (err: Error) => {
                    console.error('Torrent error:', err);
                    setState(s => ({ ...s, isLoading: false, error: err.message }));
                });

            } catch (err: any) {
                console.error('WebTorrent error:', err);
                setState(s => ({ ...s, isLoading: false, error: err.message }));
            }
        };

        startTorrent();

        return () => {
            if (clientRef.current) {
                clientRef.current.destroy();
                clientRef.current = null;
            }
        };
    }, [magnetUri]);

    // Format speed
    const formatSpeed = useCallback((bytesPerSec: number): string => {
        if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)} B/s`;
        if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
        return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
    }, []);

    return {
        ...state,
        videoRef,
        formatSpeed,
        downloadSpeedFormatted: formatSpeed(state.downloadSpeed),
        uploadSpeedFormatted: formatSpeed(state.uploadSpeed),
    };
}
