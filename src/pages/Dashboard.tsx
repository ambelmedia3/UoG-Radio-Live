import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Heart, Download, Settings, Bell } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();

  if (!user) {
    return <div className="p-8 text-center text-zinc-400">Please sign in to view your dashboard.</div>;
  }

  return (
    <div className="min-h-full bg-zinc-950 text-white p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-8">My Dashboard</h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex items-center space-x-6 mb-8">
          <img 
            src={profile?.photoURL || user.photoURL || ''} 
            alt="Profile" 
            className="w-24 h-24 rounded-full border-4 border-zinc-800 shadow-xl"
          />
          <div>
            <h2 className="text-2xl font-bold text-white">{profile?.displayName || user.displayName}</h2>
            <p className="text-zinc-400">{profile?.email || user.email}</p>
            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 uppercase tracking-wider">
              {profile?.role || 'User'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Favorites</h3>
            <p className="text-sm text-zinc-400">You have {profile?.favorites?.length || 0} saved programs.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Download className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Downloads</h3>
            <p className="text-sm text-zinc-400">Access your offline programs.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bell className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Notifications</h3>
            <p className="text-sm text-zinc-400">Manage your alerts and reminders.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Settings className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Settings</h3>
            <p className="text-sm text-zinc-400">Language preferences and account details.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
