import React from 'react';
import { Radio, Play, Square, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';

export const LivePlayer: React.FC = () => {
  const {
    playerState,
    retryCount,
    volume,
    isMuted,
    togglePlay,
    handleVolumeChange,
    toggleMute
  } = usePlayer();

  const getStatusMessage = () => {
    switch (playerState) {
      case 'idle': return 'Ready to play';
      case 'connecting': return 'Connecting to stream...';
      case 'buffering': return 'Buffering...';
      case 'playing': return 'Live Broadcast';
      case 'error': return 'Stream unavailable. Retrying...';
      case 'reconnecting': return `Reconnecting (Attempt ${retryCount})...`;
      default: return '';
    }
  };

  const isActive = playerState === 'playing' || playerState === 'buffering';
  const isPending = playerState === 'connecting' || playerState === 'reconnecting' || playerState === 'buffering';

  return (
    <div className="h-20 bg-zinc-900 border-t border-zinc-800 flex items-center px-6 justify-between shrink-0 z-10">
      <div className="flex items-center space-x-4 w-1/3">
         <div className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center relative overflow-hidden">
           <Radio className={`w-6 h-6 ${isActive ? 'text-emerald-400' : playerState === 'error' ? 'text-red-400' : 'text-zinc-500'}`} />
           {isActive && (
             <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
           )}
         </div>
         <div>
           <div className="flex items-center space-x-2">
             <h3 className="text-sm font-medium text-white">UoG Live Radio</h3>
             {(isActive || playerState === 'connecting' || playerState === 'reconnecting') && (
               <span className="flex h-2 w-2 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
               </span>
             )}
           </div>
           <p className={`text-xs ${playerState === 'error' || playerState === 'reconnecting' ? 'text-red-400' : playerState === 'buffering' ? 'text-amber-400' : 'text-zinc-400'}`}>
             {getStatusMessage()}
           </p>
         </div>
      </div>
      
      <div className="flex flex-col items-center justify-center w-1/3">
         <div className="flex items-center space-x-6">
            <button 
              onClick={togglePlay}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isActive || playerState === 'connecting' || playerState === 'reconnecting'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 shadow-lg shadow-emerald-500/20' 
                  : playerState === 'error'
                  ? 'bg-red-500 text-white hover:bg-red-600 hover:scale-105 shadow-lg shadow-red-500/20'
                  : 'bg-white text-zinc-900 hover:bg-zinc-200 hover:scale-105'
              }`}
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isActive ? (
                <Square className="w-5 h-5 fill-current" />
              ) : playerState === 'error' ? (
                <Square className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-1" />
              )}
            </button>
         </div>
         <div className="w-full max-w-md flex items-center space-x-3 mt-3">
            <span className={`text-xs font-bold tracking-wider ${isActive ? 'text-red-500' : 'text-zinc-600'}`}>
              LIVE
            </span>
            <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden relative">
              {playerState !== 'idle' && (
                <div className={`absolute inset-0 ${playerState === 'error' || playerState === 'reconnecting' ? 'bg-red-500/50' : playerState === 'buffering' ? 'bg-amber-500/50' : 'bg-emerald-500/50'} w-full animate-pulse`}></div>
              )}
            </div>
         </div>
      </div>
      
      <div className="w-1/3 flex justify-end items-center space-x-4">
        <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition-colors">
          {isMuted || volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-24 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>
    </div>
  );
};
