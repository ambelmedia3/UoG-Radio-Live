import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ArrowLeft, Clock, Tag, PlayCircle, FileText, AlignLeft, Sparkles, Heart, Share2, Copy, Check, Twitter, Facebook, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

interface Program {
  id: string;
  title: string;
  description: string;
  summary?: string;
  transcript?: string;
  audioUrl: string;
  date: string;
  faculty: string;
  type: string;
  tags: string[];
  views: number;
}

export const ProgramDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'description' | 'transcript' | 'summary'>('description');
  const { user, profile } = useAuth();
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isFavorited = profile?.favorites?.includes(program?.id || '') || false;

  const handleToggleFavorite = async () => {
    if (!user || !program) return;
    setIsTogglingFavorite(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      if (isFavorited) {
        await updateDoc(userRef, {
          favorites: arrayRemove(program.id)
        });
      } else {
        await updateDoc(userRef, {
          favorites: arrayUnion(program.id)
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const programUrl = window.location.href;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(programUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const shareToTwitter = () => {
    if (!program) return;
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(programUrl)}&text=${encodeURIComponent(`Check out this program: ${program.title}`)}`;
    window.open(url, '_blank');
    setIsShareMenuOpen(false);
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(programUrl)}`;
    window.open(url, '_blank');
    setIsShareMenuOpen(false);
  };

  const shareToEmail = () => {
    if (!program) return;
    const subject = encodeURIComponent(program.title);
    const body = encodeURIComponent(`Check out this program: ${program.title}\n\n${programUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsShareMenuOpen(false);
  };

  useEffect(() => {
    const fetchProgram = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'programs', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProgram({ id: docSnap.id, ...docSnap.data() } as Program);
        } else {
          console.error("No such program!");
        }
      } catch (error) {
        console.error("Error fetching program:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-full bg-zinc-950 text-white p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-full bg-zinc-950 text-white p-8 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Program not found</h2>
        <button 
          onClick={() => navigate('/archive')}
          className="flex items-center text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Archive
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-950 text-white p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/archive')}
          className="flex items-center text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Archive
        </button>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden mb-8">
          <div className="h-64 md:h-80 bg-zinc-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent z-10"></div>
            <img 
              src={`https://picsum.photos/seed/${program.id}/1200/600`} 
              alt={program.title}
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-6 left-6 right-6 z-20">
              <div className="flex items-center space-x-3 text-sm text-zinc-300 mb-3 font-mono">
                <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {program.faculty || 'General'}
                </span>
                <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {format(new Date(program.date), 'MMMM d, yyyy')}</span>
                <span>•</span>
                <span>{program.views || 0} listens</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                {program.title}
              </h1>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-8 w-full bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50 flex flex-col items-center">
              <div className="flex items-center w-full mb-2">
                <PlayCircle className="w-5 h-5 text-emerald-400 mr-2" />
                <span className="text-sm font-medium text-zinc-300">Listen to Broadcast</span>
              </div>
              <audio 
                controls 
                src={program.audioUrl} 
                className="w-full h-12 rounded-lg outline-none"
              >
                Your browser does not support the audio element.
              </audio>
              
              <div className="w-full flex justify-end mt-4 pt-4 border-t border-zinc-800/50 space-x-3">
                <div className="relative">
                  <button 
                    onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  
                  {isShareMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden">
                      <button 
                        onClick={copyToClipboard}
                        className="w-full flex items-center px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        {isCopied ? <Check className="w-4 h-4 mr-3 text-emerald-400" /> : <Copy className="w-4 h-4 mr-3" />}
                        {isCopied ? 'Copied!' : 'Copy Link'}
                      </button>
                      <button 
                        onClick={shareToTwitter}
                        className="w-full flex items-center px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border-t border-zinc-800"
                      >
                        <Twitter className="w-4 h-4 mr-3 text-sky-400" />
                        Share on Twitter
                      </button>
                      <button 
                        onClick={shareToFacebook}
                        className="w-full flex items-center px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border-t border-zinc-800"
                      >
                        <Facebook className="w-4 h-4 mr-3 text-blue-500" />
                        Share on Facebook
                      </button>
                      <button 
                        onClick={shareToEmail}
                        className="w-full flex items-center px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border-t border-zinc-800"
                      >
                        <Mail className="w-4 h-4 mr-3 text-zinc-400" />
                        Share via Email
                      </button>
                    </div>
                  )}
                </div>

                {user && (
                  <button 
                    onClick={handleToggleFavorite}
                    disabled={isTogglingFavorite}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      isFavorited 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                        : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                    <span>{isFavorited ? 'Saved to Favorites' : 'Save to Favorites'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex space-x-2 bg-zinc-950 p-1 rounded-xl mb-8 w-fit border border-zinc-800 overflow-x-auto max-w-full">
              <button 
                onClick={() => setActiveTab('description')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${activeTab === 'description' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
              >
                <AlignLeft className="w-4 h-4" />
                <span>Description</span>
              </button>
              {program.summary && (
                <button 
                  onClick={() => setActiveTab('summary')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${activeTab === 'summary' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Summary</span>
                </button>
              )}
              {program.transcript && (
                <button 
                  onClick={() => setActiveTab('transcript')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${activeTab === 'transcript' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Transcript</span>
                </button>
              )}
            </div>

            <div className="prose prose-invert max-w-none">
              {activeTab === 'description' && (
                <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {program.description}
                </div>
              )}
              
              {activeTab === 'summary' && program.summary && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                  <div className="flex items-center mb-4 text-emerald-400">
                    <Sparkles className="w-5 h-5 mr-2" />
                    <h3 className="text-lg font-semibold m-0">AI Generated Summary</h3>
                  </div>
                  <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {program.summary}
                  </div>
                </div>
              )}

              {activeTab === 'transcript' && program.transcript && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center mb-4 text-zinc-400">
                    <FileText className="w-5 h-5 mr-2" />
                    <h3 className="text-lg font-semibold m-0 text-white">Full Transcript</h3>
                  </div>
                  <div className="text-zinc-400 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                    {program.transcript}
                  </div>
                </div>
              )}
            </div>

            {program.tags && program.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-zinc-800">
                {program.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center text-sm bg-zinc-950 border border-zinc-800 text-zinc-400 px-3 py-1.5 rounded-lg">
                    <Tag className="w-3.5 h-3.5 mr-1.5 opacity-50" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
