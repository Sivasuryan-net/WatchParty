import { useState, useEffect, useRef, useCallback } from 'react';
// WebTorrent is loaded via CDN in index.html
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// TypeScript declaration for global WebTorrent
declare global {
    interface Window {
        WebTorrent: any;
    }
    // Buffer is provided by node-polyfills
    const Buffer: typeof import('buffer').Buffer;
}

interface TorrentFile {
    index: number;
    name: string;
    path: string;
    size: number;
    sizeFormatted: string;
    isVideo?: boolean;
    fileObject?: any; // WebTorrent file object
}

interface TorrentState {
    isLoading: boolean;
    isReady: boolean;
    error: string | null;
    files: TorrentFile[];
    selectedFile: TorrentFile | null;
    videoUrl: string | null;
    infoHash: string | null;
    downloadSpeed: number;
    peers: number;
    progress: number;
}

// Initialize WebTorrent client from global (loaded via CDN)
const getClient = () => {
    if (typeof window !== 'undefined' && window.WebTorrent) {
        return new window.WebTorrent();
    }
    return null;
};

const client = getClient();

export function useWebTorrent(magnetUri: string | null) {
    const [state, setState] = useState<TorrentState>({
        isLoading: false,
        isReady: false,
        error: null,
        files: [],
        selectedFile: null,
        videoUrl: null,
        infoHash: null,
        downloadSpeed: 0,
        peers: 0,
        progress: 0
    });

    const ffmpegRef = useRef<FFmpeg | null>(null);
    const torrentRef = useRef<any>(null);

    // Format size helper
    const formatSize = (bytes: number) => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let i = 0;
        while (bytes >= 1024 && i < units.length - 1) {
            bytes /= 1024;
            i++;
        }
        return bytes.toFixed(2) + ' ' + units[i];
    };

    // Initialize FFmpeg
    useEffect(() => {
        const loadFFmpeg = async () => {
            const ffmpeg = new FFmpeg();
            ffmpegRef.current = ffmpeg;
            // We'll load the core in useTranscode or when needed
            // For now just instantiate
        };
        loadFFmpeg();
    }, []);

    // Handle Magnet Link
    useEffect(() => {
        if (!magnetUri || !client) {
            if (torrentRef.current) {
                torrentRef.current.destroy();
                torrentRef.current = null;
            }
            setState(s => ({ ...s, videoUrl: null, isReady: false, files: [], infoHash: null }));
            if (!client) {
                setState(s => ({ ...s, error: 'WebTorrent not loaded. Please refresh the page.' }));
            }
            return;
        }

        // Check if already added
        const existingTorrent = client.get(magnetUri);
        if (existingTorrent) {
            handleTorrentReady(existingTorrent);
            return;
        }

        setState(s => ({ ...s, isLoading: true, error: null }));

        console.log('[WebTorrent] Adding torrent...', magnetUri);

        const torrent = client.add(magnetUri, {
            // optimized for browser
        });

        torrentRef.current = torrent;

        torrent.on('ready', () => {
            console.log('[WebTorrent] Ready');
            handleTorrentReady(torrent);
        });

        torrent.on('error', (err: Error) => {
            console.error('[WebTorrent] Error:', err);
            setState(s => ({ ...s, isLoading: false, error: err.message }));
        });

        // Cleanup function
        return () => {
            // We generally want to persist the client, but maybe stop the torrent if unmounted?
            // For now, keep seeding in background as is typical for SPA
            // But valid use case to destroy to save memory/bandwidth
            // client.remove(magnetUri); 
        };
    }, [magnetUri]);

    const handleTorrentReady = (torrent: any) => {
        const files: TorrentFile[] = torrent.files.map((file: any, index: number) => ({
            index,
            name: file.name,
            path: file.path,
            size: file.length,
            sizeFormatted: formatSize(file.length),
            isVideo: /\.(mkv|mp4|avi|webm|mov)$/i.test(file.name),
            fileObject: file
        }));

        // Find largest video
        const videoFiles = files.filter(f => f.isVideo);
        const selectedFile = videoFiles.length > 0
            ? videoFiles.reduce((a, b) => a.size > b.size ? a : b)
            : files[0];

        setState(s => ({
            ...s,
            isLoading: false,
            isReady: true,
            files,
            selectedFile,
            infoHash: torrent.infoHash,
            peers: torrent.numPeers,
            downloadSpeed: torrent.downloadSpeed,
            progress: torrent.progress
        }));

        if (selectedFile) {
            streamFile(selectedFile);
        }

        // Monitoring interval
        const interval = setInterval(() => {
            if (torrent.destroyed) {
                clearInterval(interval);
                return;
            }
            setState(s => ({
                ...s,
                downloadSpeed: torrent.downloadSpeed,
                peers: torrent.numPeers,
                progress: torrent.progress
            }));
        }, 1000);
    };

    const streamFile = async (file: TorrentFile) => {
        if (!file.fileObject) return;

        console.log('[WebTorrent] Streaming file:', file.name);

        // Check if supported natively (MP4, WebM)
        if (/\.(mp4|webm)$/i.test(file.name)) {
            // Direct stream
            file.fileObject.renderTo(null, {
                callback: (err: Error | null, elem: HTMLVideoElement) => {
                    if (err) console.error(err);
                }
            });
            // WebTorrent renderTo is for appending to DOM. 
            // For React custom player, we need the Blob URL or stream it.

            // Get blob URL
            file.fileObject.getBlobURL((err: Error | null, url: string) => {
                if (err) {
                    console.error('[WebTorrent] Blob error:', err);
                    return;
                }
                console.log('[WebTorrent] Generated Blob URL:', url);
                setState(s => ({ ...s, videoUrl: url }));
            });
        } else {
            // Needs transcoding (MKV, AVI)
            if (!ffmpegRef.current) {
                setState(s => ({ ...s, error: 'Transcoder not initialized' }));
                return;
            }

            try {
                const ffmpeg = ffmpegRef.current;

                // Load ffmpeg core if not loaded
                if (!ffmpeg.loaded) {
                    console.log('[Transcode] Loading FFmpeg core...');
                    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
                    await ffmpeg.load({
                        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                        // workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'), // Not always needed depending on version
                    });
                }

                console.log('[Transcode] Starting transcoding for:', file.name);

                // 1. Get file data as Uint8Array
                setState(s => ({ ...s, isLoading: true, error: null }));

                // We need to read the chunk from WebTorrent. 
                // For a full file transcode (simple version), we download the whole file to memory first.
                // In a production app, we would pipe chunks, but ffmpeg.wasm file system complicates streaming pipes.
                // Optimally for this demo: Download file -> Write to MEMFS -> Transcode -> Read output -> Create Blob

                file.fileObject.getBuffer(async (err: Error | null, buffer: any) => {
                    if (err) {
                        console.error(err);
                        setState(s => ({ ...s, error: 'Failed to download file for transcoding' }));
                        return;
                    }

                    console.log('[Transcode] File downloaded to memory, writing to virtual FS...');
                    const inputName = 'input.mkv';
                    const outputName = 'output.mp4';

                    await ffmpeg.writeFile(inputName, buffer);

                    console.log('[Transcode] Running FFmpeg...');
                    // Fast transcode settings
                    await ffmpeg.exec([
                        '-i', inputName,
                        '-c:v', 'copy', // Try copying video stream first (fastest) if codec is supported (h264)
                        '-c:a', 'aac',  // Convert audio to AAC (browsers love AAC)
                        '-strict', 'experimental',
                        outputName
                    ]);

                    console.log('[Transcode] Done, reading output...');
                    const data = await ffmpeg.readFile(outputName);

                    const blob = new Blob([data as any], { type: 'video/mp4' });
                    const url = URL.createObjectURL(blob);

                    console.log('[Transcode] Transcoding complete. Blob URL:', url);

                    setState(s => ({
                        ...s,
                        isLoading: false,
                        videoUrl: url
                    }));

                    // Cleanup
                    await ffmpeg.deleteFile(inputName);
                    await ffmpeg.deleteFile(outputName);
                });

            } catch (error) {
                console.error('[Transcode] Error:', error);
                setState(s => ({
                    ...s,
                    isLoading: false,
                    error: `Transcoding failed: ${error instanceof Error ? error.message : String(error)}`
                }));
            }
        }
    };

    const selectFile = useCallback((file: TorrentFile) => {
        setState(s => ({ ...s, selectedFile: file }));
        streamFile(file);
    }, []);

    const downloadSpeedFormatted = (state.downloadSpeed / 1024 / 1024).toFixed(2) + ' MB/s';

    return {
        ...state,
        torrentName: state.selectedFile?.name || '',
        downloadSpeedFormatted,
        selectFile
    };
}

export const useVideoSource = useWebTorrent;
