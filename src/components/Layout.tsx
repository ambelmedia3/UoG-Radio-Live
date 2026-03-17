import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, logout } from '../firebase';
import { Radio, Archive, Calendar, User, LogOut, LogIn, Settings, MessageSquare, Newspaper } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LivePlayer } from './LivePlayer';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Layout: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Live Radio', path: '/', icon: Radio },
    { name: 'Archive', path: '/archive', icon: Archive },
    { name: 'Schedule', path: '/schedule', icon: Calendar },
    { name: 'News & Magazine', path: '/news', icon: Newspaper },
    { name: 'Chatbot', path: '/chatbot', icon: MessageSquare },
  ];

  if (user) {
    navItems.push({ name: 'My Dashboard', path: '/dashboard', icon: User });
  }

  if (isAdmin) {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: Settings });
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Knowledge</h1>
            <h2 className="text-emerald-400 text-sm font-medium">Archive</h2>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group",
                  isActive 
                    ? "bg-zinc-800 text-white" 
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-400")} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                <img src={profile?.photoURL || user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full bg-zinc-800" />
                <div className="truncate">
                  <p className="text-sm font-medium text-white truncate">{profile?.displayName || user.displayName}</p>
                  <p className="text-xs text-zinc-500 truncate">{profile?.role}</p>
                </div>
              </div>
              <button onClick={logout} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center space-x-2 bg-white text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
        
        {/* Persistent Player Bar */}
        <LivePlayer />
      </main>
    </div>
  );
};
