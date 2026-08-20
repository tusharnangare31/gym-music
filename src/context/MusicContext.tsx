import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

// YouTube IFrame API types
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

declare namespace YT {
  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  interface PlayerOptions {
    width?: string | number;
    height?: string | number;
    videoId?: string;
    playerVars?: Record<string, unknown>;
    events?: {
      onReady?: (event: { target: Player }) => void;
      onStateChange?: (event: { data: number; target: Player }) => void;
      onError?: (event: { data: number }) => void;
    };
  }

  class Player {
    constructor(elementId: string, options: PlayerOptions);
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    nextVideo(): void;
    previousVideo(): void;
    playVideoAt(index: number): void;
    seekTo(seconds: number, allowSeekAhead?: boolean): void;
    setVolume(volume: number): void;
    getVolume(): number;
    getCurrentTime(): number;
    getDuration(): number;
    getPlayerState(): number;
    getPlaylist(): string[] | null;
    getPlaylistIndex(): number;
    setShuffle(shuffle: boolean): void;
    setLoop(loop: boolean): void;
    getVideoData(): { video_id: string; title: string; author: string };
    loadVideoById(videoId: string): void;
    cueVideoById(videoId: string): void;
    cuePlaylist(options: Record<string, unknown>): void;
    destroy(): void;
  }
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  videoId: string;
  cover: string;
}

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Song[];
  isReady: boolean;
  togglePlay: () => void;
  nextSong: () => void;
  previousSong: () => void;
  playAtIndex: (index: number) => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
}

// YouTube playlist ID extracted from the user's link
const PLAYLIST_ID = 'PLVm5_C02i2jw';

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(100);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isReady, setIsReady] = useState(false);

  const playerRef = useRef<YT.Player | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playlistBuiltRef = useRef(false);
  const autoplayAttemptedRef = useRef(false);

  // Update current song info from the YT player
  const updateSongInfo = useCallback(() => {
    setTimeout(() => {
      if (!playerRef.current) return;
      try {
        const data = playerRef.current.getVideoData();
        if (data?.video_id) {
          setCurrentSong({
            id: data.video_id,
            title: data.title || 'Loading…',
            artist: data.author || 'YouTube',
            videoId: data.video_id,
            cover: `https://i.ytimg.com/vi/${data.video_id}/mqdefault.jpg`,
          });
        }
      } catch {
        // Player not ready yet
      }
    }, 500);
  }, []);

  // Build playlist from YT player data and fetch titles via oembed
  const buildPlaylist = useCallback(async () => {
    if (playlistBuiltRef.current || !playerRef.current) return;
    
    let ids: string[] | null = null;
    try {
      ids = playerRef.current.getPlaylist();
    } catch {
      return;
    }
    
    if (!ids || ids.length === 0) {
      setTimeout(() => buildPlaylist(), 800);
      return;
    }
    
    playlistBuiltRef.current = true;

    // Start with placeholder entries
    const initialQueue: Song[] = ids.map((videoId, index) => ({
      id: videoId,
      title: `Track ${index + 1}`,
      artist: 'YouTube',
      videoId,
      cover: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    }));
    setQueue(initialQueue);

    // Fetch real titles in the background via oembed
    const updatedQueue = [...initialQueue];
    await Promise.allSettled(
      ids.map(async (videoId, index) => {
        try {
          const resp = await fetch(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`
          );
          if (resp.ok) {
            const data = await resp.json();
            updatedQueue[index] = {
              ...updatedQueue[index],
              title: data.title || `Track ${index + 1}`,
              artist: data.author_name || 'YouTube',
            };
          }
        } catch {
          // Keep placeholder
        }
      })
    );
    setQueue([...updatedQueue]);
  }, []);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    function initPlayer() {
      new window.YT.Player('yt-player', {
        width: '220',
        height: '124',
        playerVars: {
          listType: 'playlist',
          list: PLAYLIST_ID,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            playerRef.current = event.target;
            event.target.setVolume(100);
            setIsReady(true);

            // Shuffle and cue from a random position
            const randomIndex = Math.floor(Math.random() * 22);
            event.target.cuePlaylist({
              listType: 'playlist',
              list: PLAYLIST_ID,
              index: randomIndex,
              startSeconds: 0,
            });
            event.target.setShuffle(true);

            // Build playlist after a short delay
            setTimeout(() => {
              updateSongInfo();
              buildPlaylist();
            }, 1200);

            // Start progress polling
            progressTimerRef.current = setInterval(() => {
              if (playerRef.current) {
                try {
                  setCurrentTime(playerRef.current.getCurrentTime() || 0);
                  setDuration(playerRef.current.getDuration() || 0);
                } catch {
                  // ignore
                }
              }
            }, 500);
          },
          onStateChange: (event) => {
            switch (event.data) {
              case 1: // PLAYING
                setIsPlaying(true);
                updateSongInfo();
                break;
              case 2: // PAUSED
                setIsPlaying(false);
                updateSongInfo();
                break;
              case 5: // CUED
                setIsPlaying(false);
                updateSongInfo();
                // Auto-play on first cue
                if (!autoplayAttemptedRef.current) {
                  autoplayAttemptedRef.current = true;
                  setTimeout(() => playerRef.current?.playVideo(), 300);
                }
                break;
              case 0: // ENDED
                setIsPlaying(false);
                updateSongInfo();
                break;
            }
          },
          onError: (event) => {
            console.error('YouTube player error:', event.data);
            // Skip to next on error
            playerRef.current?.nextVideo();
          },
        },
      });
    }

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { /* ignore */ }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Volume sync
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    const state = playerRef.current.getPlayerState();
    if (state === 1) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const nextSong = () => {
    if (!playerRef.current) return;
    playerRef.current.nextVideo();
    updateSongInfo();
  };

  const previousSong = () => {
    if (!playerRef.current) return;
    playerRef.current.previousVideo();
    updateSongInfo();
  };

  const playAtIndex = (index: number) => {
    if (!playerRef.current) return;
    playerRef.current.playVideoAt(index);
    updateSongInfo();
  };

  const seek = (time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
      setCurrentTime(time);
    }
  };

  const setVolume = (newVolume: number) => setVolumeState(Math.max(0, Math.min(100, Math.round(newVolume))));

  return (
    <MusicContext.Provider value={{
      currentSong,
      isPlaying,
      currentTime,
      duration,
      volume,
      queue,
      isReady,
      togglePlay,
      nextSong,
      previousSong,
      playAtIndex,
      seek,
      setVolume,
    }}>
      {/* Hidden YouTube player — off-screen like lohalakkad.in */}
      <div style={{ position: 'fixed', left: 12, bottom: 12, zIndex: -3, width: 220, height: 124, opacity: 0.01, pointerEvents: 'none' }}>
        <div id="yt-player"></div>
      </div>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
