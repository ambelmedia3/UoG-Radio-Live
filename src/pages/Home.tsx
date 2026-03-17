import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Calendar, Users, Radio, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';

export const Home: React.FC = () => {
  const [bars, setBars] = useState<number[]>([]);
  const { playerState, togglePlay } = usePlayer();

  const isActive = playerState === 'playing' || playerState === 'buffering';
  const isPending = playerState === 'connecting' || playerState === 'reconnecting';

  useEffect(() => {
    // Generate random heights for the visualizer
    const generateBars = () => {
      // If active, bars are higher and more dynamic. If inactive, they are low and subtle.
      setBars(Array.from({ length: 40 }, () => 
        isActive ? Math.random() * 100 : Math.random() * 20 + 5
      ));
    };
    generateBars();
    const interval = setInterval(generateBars, isActive ? 100 : 300);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="min-h-full bg-zinc-950 text-white p-8 overflow-y-auto">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 p-10 mb-12">
        <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-1000 z-0 ${isActive ? 'from-emerald-900/40 to-zinc-900/80' : 'from-emerald-900/10 to-zinc-900/50'}`}></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Now</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              University of Gondar <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                Knowledge Archive
              </span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
              Transforming research outputs into accessible educational content for students, faculty, local communities, and the Ethiopian diaspora.
            </p>
            <div className="flex items-center space-x-4 pt-4">
              <button 
                onClick={togglePlay}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 ${
                  isActive 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950'
                }`}
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isActive ? (
                  <Square className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current" />
                )}
                <span>{isPending ? 'Connecting...' : isActive ? 'Stop Playing' : 'Listen Live'}</span>
              </button>
              <Link to="/archive" className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all">
                <span>Browse Archive</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Animated Visualizer */}
          <div className={`w-full md:w-1/3 h-64 rounded-2xl border p-6 flex flex-col justify-end relative overflow-hidden backdrop-blur-sm transition-all duration-500 ${
            isActive ? 'bg-zinc-900/80 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'bg-zinc-950/50 border-zinc-800/50'
          }`}>
            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <Radio className={`w-4 h-4 ${isActive ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
              <span className={`text-xs font-mono uppercase tracking-wider ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {isActive ? 'Now Playing' : 'Live Stream'}
              </span>
            </div>
            <div className="flex items-end justify-between h-32 gap-1">
              {bars.map((height, i) => (
                <motion.div
                  key={i}
                  className={`w-full rounded-t-sm ${isActive ? 'bg-emerald-400' : 'bg-emerald-500/50'}`}
                  animate={{ height: `${height}%` }}
                  transition={{ type: 'tween', duration: isActive ? 0.1 : 0.3 }}
                  style={{ opacity: isActive ? 0.6 + (height / 250) : 0.3 + (height / 200) }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats / Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Community Reach</h3>
            <p className="text-sm text-zinc-400 mt-1">Connecting the university with local and diaspora communities.</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI-Powered</h3>
            <p className="text-sm text-zinc-400 mt-1">Automatic transcription, translation, and summarization.</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">24/7 Archive</h3>
            <p className="text-sm text-zinc-400 mt-1">Access past programs anytime, anywhere on any device.</p>
          </div>
        </div>
      </div>

      {/* Upcoming Schedule */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Upcoming Schedule</h2>
          <Link to="/schedule" className="text-emerald-400 text-sm font-medium hover:text-emerald-300">View Full Schedule</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition-colors group cursor-pointer">
              <div className="text-xs font-mono text-zinc-500 mb-2">TODAY, {10 + i}:00 AM</div>
              <h3 className="text-white font-medium text-lg leading-snug mb-1 group-hover:text-emerald-400 transition-colors">Research Innovations in Agriculture</h3>
              <p className="text-sm text-zinc-400">Dr. Abebe Tadesse</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
