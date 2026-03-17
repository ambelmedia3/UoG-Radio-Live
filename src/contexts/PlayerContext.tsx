import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

export type PlayerStatus = 'idle' | 'connecting' | 'playing' | 'buffering' | 'error' | 'reconnecting';

interface PlayerContextType {
  playerState: PlayerStatus;
  retryCount: number;
  volume: number;
  isMuted: boolean;
  togglePlay: () => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleMute: () => void;
}

const STREAM_URL = "http://yourserver:8000/uogradio";

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playerState, setPlayerState] = useState<PlayerStatus>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;
    
    const handlePlaying = () => {
      setPlayerState('playing');
      setRetryCount(0);
    };

    const handleWaiting = () => {
      setPlayerState('buffering');
    };

    const handleError = () => {
      console.log("Stream error encountered.");
      setPlayerState('error');
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (audioRef.current) {
          setRetryCount(prev => prev + 1);
          setPlayerState('reconnecting');
          loadStream();
        }
      }, 4000);
    };

    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('error', handleError);
    audio.addEventListener('stalled', handleError);
    audio.addEventListener('waiting', handleWaiting);

    return () => {
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('stalled', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.pause();
      audio.src = '';
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const loadStream = () => {
    if (!audioRef.current) return;
    
    setPlayerState(prev => prev === 'reconnecting' ? 'reconnecting' : 'connecting');
    
    audioRef.current.src = `${STREAM_URL}?t=${new Date().getTime()}`;
    audioRef.current.load();
    
    audioRef.current.play().catch((error) => {
      console.error("Playback failed:", error);
    });
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (playerState !== 'idle') {
      audioRef.current.pause();
      audioRef.current.src = '';
      setPlayerState('idle');
      setRetryCount(0);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    } else {
      loadStream();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    audioRef.current.muted = newMutedState;
  };

  return (
    <PlayerContext.Provider value={{
      playerState,
      retryCount,
      volume,
      isMuted,
      togglePlay,
      handleVolumeChange,
      toggleMute
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
