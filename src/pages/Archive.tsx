import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Search, Filter, PlayCircle, Clock, Tag, Archive as ArchiveIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Program {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  transcript?: string;
  date: string;
  faculty: string;
  type: string;
  tags: string[];
  views: number;
}

export const Archive: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'programs'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const progData: Program[] = [];
      snapshot.forEach((doc) => {
        progData.push({ id: doc.id, ...doc.data() } as Program);
      });
      setPrograms(progData);
    }, (error) => {
      console.error("Error fetching programs:", error);
    });

    return () => unsubscribe();
  }, []);

  const filteredPrograms = programs.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.faculty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-full bg-zinc-950 text-white p-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Knowledge Archive</h1>
          <p className="text-zinc-400">Browse and search through past university broadcasts.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search programs, faculty..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full md:w-80 transition-all"
            />
          </div>
          <button className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.length > 0 ? (
          filteredPrograms.map((program) => (
            <div 
              key={program.id} 
              onClick={() => navigate(`/program/${program.id}`)}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all group flex flex-col cursor-pointer"
            >
              <div className="h-48 bg-zinc-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10"></div>
                <img 
                  src={`https://picsum.photos/seed/${program.id}/600/400`} 
                  alt={program.title}
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlayingId(playingId === program.id ? null : program.id);
                  }}
                  className="absolute bottom-4 right-4 z-20 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-zinc-950 shadow-lg hover:scale-110 transition-transform"
                >
                  <PlayCircle className="w-6 h-6 fill-current" />
                </button>
                <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/10">
                  {program.faculty || 'General'}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center space-x-3 text-xs text-zinc-500 mb-3 font-mono">
                  <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {format(new Date(program.date), 'MMM d, yyyy')}</span>
                  <span>•</span>
                  <span>{program.views || 0} listens</span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                  {program.title}
                </h3>
                
                <p className="text-sm text-zinc-400 line-clamp-3 mb-4 flex-1">
                  {program.description}
                </p>
                
                <div className="flex items-center space-x-3 mb-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/program/${program.id}`);
                    }}
                    className="flex items-center text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    View Details & Transcript
                  </button>
                </div>
                
                {playingId === program.id && (
                  <div 
                    className="mb-4 w-full bg-zinc-950/50 rounded-lg p-2 border border-zinc-800/50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <audio 
                      controls 
                      autoPlay 
                      src={program.audioUrl} 
                      className="w-full h-10 rounded-md outline-none"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-zinc-800/50">
                  {program.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="inline-flex items-center text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md">
                      <Tag className="w-3 h-3 mr-1 opacity-50" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArchiveIcon className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No programs found</h3>
            <p className="text-zinc-500">Try adjusting your search or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};
