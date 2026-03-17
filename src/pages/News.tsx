import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Newspaper, Calendar, ArrowUpDown } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
  audioUrl?: string;
  tags?: string[];
}

export const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('date', sortOrder));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: NewsItem[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as NewsItem);
      });
      setNews(data);
    });

    return () => unsubscribe();
  }, [sortOrder]);

  return (
    <div className="min-h-full bg-zinc-950 text-white p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white mb-2">News & Magazine</h1>
              <p className="text-zinc-400">Latest updates, articles, and references from the Knowledge Archive.</p>
            </div>
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 md:hidden ml-4">
              <Newspaper className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
              <ArrowUpDown className="w-4 h-4 text-zinc-500 mr-2" />
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                className="bg-transparent text-sm text-zinc-300 focus:outline-none cursor-pointer appearance-none pr-4"
              >
                <option value="desc" className="bg-zinc-900">Newest First</option>
                <option value="asc" className="bg-zinc-900">Oldest First</option>
              </select>
            </div>
            <div className="hidden md:flex w-16 h-16 bg-emerald-500/10 rounded-2xl items-center justify-center border border-emerald-500/20">
              <Newspaper className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.length > 0 ? (
            news.map((item) => (
              <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors group flex flex-col">
                {item.imageUrl && (
                  <div className="h-48 w-full overflow-hidden">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center space-x-2 text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed flex-1 whitespace-pre-wrap">{item.content}</p>
                  
                  {item.audioUrl && (
                    <div className="mt-4 w-full bg-zinc-950/50 rounded-lg p-2 border border-zinc-800/50">
                      <audio 
                        controls 
                        src={item.audioUrl} 
                        className="w-full h-10 rounded-md outline-none"
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="bg-zinc-950 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded-lg text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-3xl">
              <Newspaper className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No news published yet</h3>
              <p className="text-zinc-500">Check back later for updates and articles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
