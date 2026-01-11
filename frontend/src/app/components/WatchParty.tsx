import { Play, Pause, RotateCcw, RotateCw, Volume2, Settings as SettingsIcon, Maximize, Mic, MicOff, Headphones, Send, Smile, Copy, LogOut, Link2, Loader2, Users, Download } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import type { Page } from '../App';
import type { TorrentResult, ChatMessage } from '../types';
import { useWebTorrent } from '../hooks/useWebTorrent';

interface WatchPartyProps {
  onNavigate: (page: Page, movieId?: string) => void;
  movieId: string | null;
  torrent: TorrentResult | null;
  tmdbId?: string;
  movieRuntime?: number | null; // Runtime in minutes from IMDB
}

// Current user (host)
const currentUser = {
  id: '1',
  name: 'You (Host)',
  avatar: null,
  speaking: false,
  muted: false
};

export function WatchParty({ onNavigate, movieId, torrent, tmdbId, movieRuntime }: WatchPartyProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0); // How much is buffered
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState([currentUser]);
  const [newMessage, setNewMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Get magnet URI from torrent prop
  const magnetUri = torrent?.Magnet || null;

  // Use native torrent streaming with FFmpeg transcoding
  const {
    isLoading,
    isReady,
    error,
    videoUrl,
    torrentName,
    downloadSpeedFormatted,
    peers
  } = useWebTorrent(magnetUri);

  // Room code for sharing
  const roomCode = 'CINE-' + Math.random().toString(36).substring(2, 8).toUpperCase();


  // Video playback with HLS.js support
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    console.log('[Video] Setting up playback for:', videoUrl);

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Transcoded streams are MP4, no need for HLS.js check
    const isHls = videoUrl.includes('.m3u8');

    if (isHls && Hls.isSupported()) {
      console.log('[Video] Using HLS.js for m3u8 stream');
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsRef.current = hls;

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('[HLS] Manifest parsed, starting playback');
        video.play().catch(e => console.log('[Video] Autoplay blocked:', e.message));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('[HLS] Error:', data.type, data.details);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('[HLS] Network error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('[HLS] Media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('[HLS] Fatal error, cannot recover');
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      console.log('[Video] Using native HLS support');
      video.src = videoUrl;
    } else {
      // Direct video (MP4, WebM)
      console.log('[Video] Using direct video playback');
      video.src = videoUrl;
    }

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => {
      // Only use video duration if we don't have movie runtime
      if (!movieRuntime) {
        setDuration(video.duration);
      }
    };
    const handleProgress = () => {
      // Track how much has been buffered
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBufferedTime(bufferedEnd);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleCanPlay = () => {
      console.log('[Video] Can play - video is ready');
      // Wait until we have at least 10 seconds buffered before playing
      const checkBuffer = () => {
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const bufferedSeconds = bufferedEnd - video.currentTime;
          setBufferedTime(bufferedEnd);
          console.log(`[Video] Buffered: ${bufferedSeconds.toFixed(1)}s`);
          if (bufferedSeconds >= 10) {
            video.play().catch(e => console.log('[Video] Autoplay blocked:', e.message));
            return;
          }
        }
        // Check again in 500ms
        setTimeout(checkBuffer, 500);
      };
      checkBuffer();
    };
    const handleError = () => {
      const error = video.error;
      console.error('[Video] Error:', error?.code, error?.message);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const seek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime + seconds);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: '1',
      userName: 'You',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      message: newMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  // Use movie runtime (in minutes) if available, otherwise use video duration
  const totalDuration = movieRuntime ? movieRuntime * 60 : duration;
  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  const bufferedPercent = totalDuration > 0 ? (bufferedTime / totalDuration) * 100 : 0;

  return (
    <div className="bg-background text-white overflow-hidden h-screen w-full flex">
      {/* VIDEO PLAYER SECTION */}
      <main className="relative flex-1 bg-black flex flex-col group/player">
        {/* Video Element or Loading State */}
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center gap-6 text-center p-8">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Loading Stream...</h3>
                <p className="text-gray-400 mb-4">{torrentName || 'Connecting to peers...'}</p>
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    {downloadSpeedFormatted}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {peers} peers
                  </span>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 text-center p-8">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-white">Stream Error</h3>
              <p className="text-gray-400 max-w-md">{error}</p>
              <button
                onClick={() => onNavigate('search')}
                className="mt-4 px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
              >
                Choose Another Source
              </button>
            </div>
          ) : isReady && videoUrl ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                playsInline
                onClick={togglePlay}
                controls={false}
              />
              {/* Play overlay when paused */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute z-10 flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-primary/80 hover:scale-110 transition-all duration-300"
                >
                  <Play className="w-10 h-10 fill-current ml-1" />
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center p-8">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <Play className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white">No Source Selected</h3>
              <p className="text-gray-400">Search for a movie to start streaming</p>
              <button
                onClick={() => onNavigate('search')}
                className="mt-4 px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
              >
                Find a Movie
              </button>
            </div>
          )}
        </div>

        {/* Player Controls */}
        {isReady && (
          <div className="absolute bottom-0 inset-x-0 px-6 py-6 z-20 transition-opacity duration-300 opacity-0 group-hover/player:opacity-100 bg-gradient-to-t from-black/95 to-transparent">
            {/* Progress Bar */}
            <div
              className="group/progress relative h-1.5 w-full bg-white/20 rounded-full cursor-pointer mb-4 hover:h-2.5 transition-all"
              onClick={(e) => {
                if (videoRef.current && totalDuration > 0) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percent = x / rect.width;
                  videoRef.current.currentTime = percent * totalDuration;
                }
              }}
            >
              {/* Buffered bar (grey) */}
              <div className="absolute left-0 top-0 bottom-0 bg-white/40 rounded-full transition-all" style={{ width: `${bufferedPercent}%` }}></div>
              {/* Played bar (primary color) */}
              <div className="absolute left-0 top-0 bottom-0 bg-primary rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
              {/* Scrubber dot */}
              <div className="absolute top-1/2 -translate-y-1/2 bg-white w-3 h-3 rounded-full opacity-0 group-hover/progress:opacity-100 shadow-[0_0_10px_rgba(244,37,244,0.5)] transition-opacity" style={{ left: `${progressPercent}%` }}></div>
            </div>

            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 flex items-center justify-center transition-colors">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button onClick={() => seek(-10)} className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 flex items-center justify-center transition-colors">
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button onClick={() => seek(10)} className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 flex items-center justify-center transition-colors">
                  <RotateCw className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 group/volume relative ml-2">
                  <Volume2 className="w-5 h-5 text-white/80" />
                </div>
                <div className="ml-4 text-sm font-medium text-white/80 tabular-nums">
                  {formatTime(currentTime)} <span className="text-white/40 mx-1">/</span> {formatTime(totalDuration)}
                </div>
              </div>
              {/* Right Controls */}
              <div className="flex items-center gap-3">
                {torrent?.Quality && (
                  <div className="px-2 py-1 rounded bg-white/10 text-xs font-bold text-white/90 border border-white/10">
                    {torrent.Quality}
                  </div>
                )}
                <button className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 flex items-center justify-center transition-colors" title="Settings">
                  <SettingsIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => videoRef.current?.requestFullscreen()}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 flex items-center justify-center transition-colors"
                  title="Fullscreen"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Overlay Title */}
        <div className="absolute top-0 left-0 p-6 z-20 opacity-0 group-hover/player:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-black/80 to-transparent w-full">
          <button onClick={() => onNavigate('search')} className="text-left hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
              {torrent?.Name || 'CineParty'}
            </h1>
            <p className="text-white/60 text-sm font-medium">{torrent?.source || 'Select a movie to start'}</p>
          </button>
        </div>
      </main>

      {/* SOCIAL SIDEBAR */}
      <aside className="w-96 min-w-[320px] bg-[#181118] border-l border-white/5 flex flex-col shadow-2xl z-30">
        {/* Header */}
        <header className="p-4 border-b border-white/5 bg-[#181118] z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white tracking-wide">Watch Party</h2>
            <button onClick={() => onNavigate('home')} className="text-red-400 hover:text-red-300 text-xs font-bold bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              <LogOut className="w-4 h-4" />
              Leave
            </button>
          </div>
          {/* Invite Link */}
          <div className="flex w-full items-stretch rounded-lg group focus-within:ring-1 ring-primary/50 transition-all">
            <div className="flex items-center justify-center pl-3 bg-secondary rounded-l-lg border border-r-0 border-white/10">
              <Link2 className="w-4 h-4 text-primary" />
            </div>
            <input
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden bg-secondary text-white/80 border border-x-0 border-white/10 h-10 px-2 text-xs font-mono focus:outline-0 placeholder:text-white/20"
              readOnly
              value={roomCode}
            />
            <button
              onClick={() => navigator.clipboard.writeText(roomCode)}
              className="text-white/60 hover:text-white hover:bg-white/5 flex border border-l-0 border-white/10 bg-secondary items-center justify-center px-3 rounded-r-lg transition-colors"
              title="Copy Link"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Participants */}
        <div className="px-4 py-3 bg-[#181118]/50 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">In Room ({participants.length})</h3>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
            {participants.map((user) => (
              <div key={user.id} className={`flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-1.5 rounded-lg transition-colors ${user.speaking ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${user.avatar})`, border: user.speaking ? '2px solid rgb(244, 37, 244)' : 'none' }}></div>
                  {user.speaking && (
                    <div className="absolute -bottom-1 -right-1 bg-[#181118] rounded-full p-[2px]">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  {user.speaking && (
                    <p className="text-[10px] text-primary truncate font-medium flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-primary rounded-full animate-pulse"></span> Speaking
                    </p>
                  )}
                </div>
                {user.muted ? (
                  <MicOff className="w-4 h-4 text-red-400" />
                ) : (
                  <Mic className="w-4 h-4 text-white/80" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#140d14]">
          {/* Time separator */}
          <div className="flex justify-center my-2">
            <span className="text-[10px] font-medium text-white/20 uppercase tracking-wide bg-[#181118] px-2 py-1 rounded-full">Today</span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 items-start ${msg.userId === '1' ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-cover bg-center mt-1 shrink-0" style={{ backgroundImage: `url(${msg.avatar})`, border: msg.userId === '1' ? '1px solid rgb(244, 37, 244, 0.5)' : 'none' }}></div>
              <div className={`flex flex-col gap-1 max-w-[85%] ${msg.userId === '1' ? 'items-end' : ''}`}>
                <div className={`flex items-baseline gap-2 ${msg.userId === '1' ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-xs font-bold ${msg.userId === '1' ? 'text-primary' : 'text-white/90'}`}>{msg.userName}</span>
                  <span className="text-[10px] text-white/40">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`p-3 rounded-xl border text-sm text-white/90 leading-relaxed shadow-sm ${msg.userId === '1' ? 'bg-primary/20 rounded-tr-none border-primary/20' : 'bg-secondary rounded-tl-none border-white/5'}`}>
                  {msg.message}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-[#181118] border-t border-white/5">
          <div className="relative flex items-center">
            <input
              className="w-full bg-secondary text-white border border-white/10 rounded-full h-11 pl-4 pr-24 focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all placeholder:text-white/30 text-sm"
              placeholder="Type a message..."
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <button
                onClick={handleSendMessage}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
          {/* Voice Controls */}
          <div className="mt-3 flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Voice Connected</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Toggle Mic">
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Deafen">
                <Headphones className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
