import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Edit, Radio, Calendar as CalendarIcon, FileText, Newspaper, Upload, Search } from 'lucide-react';

export const Admin: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'programs' | 'schedules' | 'news'>('programs');
  
  const [programs, setPrograms] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  
  const [newProgram, setNewProgram] = useState({
    title: '', description: '', summary: '', transcript: '', audioUrl: '', date: new Date().toISOString(), faculty: '', type: '', tags: ''
  });
  const [newSchedule, setNewSchedule] = useState({
    title: '', startTime: '', endTime: '', host: ''
  });
  const [newNewsItem, setNewNewsItem] = useState({
    title: '', content: '', date: new Date().toISOString(), imageUrl: '', audioUrl: '', tags: ''
  });
  const [newsImageFile, setNewsImageFile] = useState<File | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [programSearchTerm, setProgramSearchTerm] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    
    const pQuery = query(collection(db, 'programs'), orderBy('date', 'desc'));
    const pUnsub = onSnapshot(pQuery, (snap) => setPrograms(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    const sQuery = query(collection(db, 'schedules'), orderBy('startTime', 'asc'));
    const sUnsub = onSnapshot(sQuery, (snap) => setSchedules(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    const nQuery = query(collection(db, 'news'), orderBy('date', 'desc'));
    const nUnsub = onSnapshot(nQuery, (snap) => setNews(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    return () => { pUnsub(); sUnsub(); nUnsub(); };
  }, [isAdmin]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setSuccessMessage('');
    try {
      await addDoc(collection(db, 'programs'), {
        ...newProgram,
        tags: newProgram.tags.split(',').map(t => t.trim()).filter(Boolean),
        authorId: user.uid,
        views: 0,
      });
      setNewProgram({ title: '', description: '', summary: '', transcript: '', audioUrl: '', date: new Date().toISOString(), faculty: '', type: '', tags: '' });
      setSuccessMessage('Program uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Error adding program", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteDoc(doc(db, 'programs', id));
      } catch (error) {
        console.error("Error deleting program", error);
      }
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setSuccessMessage('');
    try {
      await addDoc(collection(db, 'schedules'), {
        ...newSchedule,
        authorId: user.uid,
      });
      setNewSchedule({ title: '', startTime: '', endTime: '', host: '' });
      setSuccessMessage('Schedule added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Error adding schedule", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteDoc(doc(db, 'schedules', id));
      } catch (error) {
        console.error("Error deleting schedule", error);
      }
    }
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setSuccessMessage('');
    try {
      let finalImageUrl = newNewsItem.imageUrl;

      if (newsImageFile) {
        const imageRef = ref(storage, `news_images/${Date.now()}_${newsImageFile.name}`);
        const snapshot = await uploadBytes(imageRef, newsImageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      const newsData = {
        ...newNewsItem,
        imageUrl: finalImageUrl,
        tags: newNewsItem.tags.split(',').map(t => t.trim()).filter(Boolean),
        authorId: user.uid,
      };

      if (editingNewsId) {
        await updateDoc(doc(db, 'news', editingNewsId), newsData);
        setSuccessMessage('News updated successfully!');
      } else {
        await addDoc(collection(db, 'news'), newsData);
        setSuccessMessage('News published successfully!');
      }

      setNewNewsItem({ title: '', content: '', date: new Date().toISOString(), imageUrl: '', audioUrl: '', tags: '' });
      setNewsImageFile(null);
      setEditingNewsId(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Error saving news", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNewsClick = (n: any) => {
    setEditingNewsId(n.id);
    setNewNewsItem({
      title: n.title,
      content: n.content,
      date: n.date,
      imageUrl: n.imageUrl || '',
      audioUrl: n.audioUrl || '',
      tags: Array.isArray(n.tags) ? n.tags.join(', ') : (n.tags || '')
    });
    setNewsImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditNews = () => {
    setEditingNewsId(null);
    setNewNewsItem({ title: '', content: '', date: new Date().toISOString(), imageUrl: '', audioUrl: '', tags: '' });
    setNewsImageFile(null);
  };

  const handleDeleteNews = async (id: string) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteDoc(doc(db, 'news', id));
      } catch (error) {
        console.error("Error deleting news", error);
      }
    }
  };

  if (!isAdmin) {
    return <div className="p-8 text-center text-zinc-400">Access Denied. Admin privileges required.</div>;
  }

  const filteredPrograms = programs.filter(p => 
    p.title.toLowerCase().includes(programSearchTerm.toLowerCase()) || 
    p.description?.toLowerCase().includes(programSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-full bg-zinc-950 text-white p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Admin Dashboard</h1>
          <p className="text-zinc-400">Manage broadcasts, schedules, and AI processing.</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-zinc-900 p-1 rounded-xl mb-8 w-fit border border-zinc-800">
        <button 
          onClick={() => setActiveTab('programs')}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2 ${activeTab === 'programs' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
        >
          <Radio className="w-4 h-4" />
          <span>Programs</span>
        </button>
        <button 
          onClick={() => setActiveTab('schedules')}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2 ${activeTab === 'schedules' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Schedules</span>
        </button>
        <button 
          onClick={() => setActiveTab('news')}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2 ${activeTab === 'news' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
        >
          <Newspaper className="w-4 h-4" />
          <span>News & Magazine</span>
        </button>
      </div>

      {activeTab === 'programs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-semibold mb-6 flex items-center"><Plus className="w-5 h-5 mr-2 text-emerald-400" /> Add New Program</h2>
            <form onSubmit={handleAddProgram} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Title</label>
                <input required type="text" value={newProgram.title} onChange={e => setNewProgram({...newProgram, title: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Description</label>
                <textarea required rows={3} value={newProgram.description} onChange={e => setNewProgram({...newProgram, description: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">AI Summary (Optional)</label>
                <textarea rows={3} value={newProgram.summary} onChange={e => setNewProgram({...newProgram, summary: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" placeholder="Paste AI-generated summary here..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Transcript (Optional)</label>
                <textarea rows={4} value={newProgram.transcript} onChange={e => setNewProgram({...newProgram, transcript: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" placeholder="Paste full transcript here..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Audio URL</label>
                <input required type="url" value={newProgram.audioUrl} onChange={e => setNewProgram({...newProgram, audioUrl: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Faculty</label>
                  <input type="text" value={newProgram.faculty} onChange={e => setNewProgram({...newProgram, faculty: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Type</label>
                  <input type="text" value={newProgram.type} onChange={e => setNewProgram({...newProgram, type: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Tags (comma separated)</label>
                <input type="text" value={newProgram.tags} onChange={e => setNewProgram({...newProgram, tags: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
              </div>
              {successMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium">
                  {successMessage}
                </div>
              )}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-semibold py-3 rounded-xl transition-colors mt-4 flex justify-center items-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-300 rounded-full animate-spin"></span>
                    <span>Publishing...</span>
                  </span>
                ) : (
                  'Publish Program'
                )}
              </button>
            </form>
          </div>
          
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold flex items-center"><FileText className="w-5 h-5 mr-2 text-emerald-400" /> Uploaded Programs</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search programs..." 
                  value={programSearchTerm}
                  onChange={(e) => setProgramSearchTerm(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                />
              </div>
            </div>
            {filteredPrograms.map(p => (
              <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between group">
                <div>
                  <h3 className="font-semibold text-white text-lg">{p.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-1">{p.description}</p>
                  <div className="flex items-center space-x-3 mt-3 text-xs text-zinc-500">
                    <span className="bg-zinc-800 px-2 py-1 rounded">{p.faculty || 'General'}</span>
                    <span>{new Date(p.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteProgram(p.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {filteredPrograms.length === 0 && <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">No programs found.</div>}
          </div>
        </div>
      )}
      
      {activeTab === 'schedules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-semibold mb-6 flex items-center"><CalendarIcon className="w-5 h-5 mr-2 text-emerald-400" /> Add Schedule</h2>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Title</label>
                <input required type="text" value={newSchedule.title} onChange={e => setNewSchedule({...newSchedule, title: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Host</label>
                <input type="text" value={newSchedule.host} onChange={e => setNewSchedule({...newSchedule, host: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Start Time</label>
                  <input required type="datetime-local" value={newSchedule.startTime} onChange={e => setNewSchedule({...newSchedule, startTime: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">End Time</label>
                  <input required type="datetime-local" value={newSchedule.endTime} onChange={e => setNewSchedule({...newSchedule, endTime: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
                </div>
              </div>
              {successMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium">
                  {successMessage}
                </div>
              )}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-semibold py-3 rounded-xl transition-colors mt-4 flex justify-center items-center"
              >
                {isSubmitting ? 'Saving...' : 'Add Schedule'}
              </button>
            </form>
          </div>
          
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold mb-6 flex items-center"><CalendarIcon className="w-5 h-5 mr-2 text-emerald-400" /> Upcoming Schedules</h2>
            {schedules.map(s => (
              <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between group">
                <div>
                  <h3 className="font-semibold text-white text-lg">{s.title}</h3>
                  <div className="flex items-center space-x-3 mt-1 text-sm text-zinc-400">
                    <span>{s.host || 'TBA'}</span>
                    <span>&bull;</span>
                    <span>{new Date(s.startTime).toLocaleString()} - {new Date(s.endTime).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDeleteSchedule(s.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {schedules.length === 0 && <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">No schedules added yet.</div>}
          </div>
        </div>
      )}

      {activeTab === 'news' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Newspaper className="w-5 h-5 mr-2 text-emerald-400" /> 
                {editingNewsId ? 'Edit News' : 'Post News'}
              </h2>
              {editingNewsId && (
                <button 
                  onClick={handleCancelEditNews}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
            <form onSubmit={handleSaveNews} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Title</label>
                <input required type="text" value={newNewsItem.title} onChange={e => setNewNewsItem({...newNewsItem, title: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Content</label>
                <textarea required rows={5} value={newNewsItem.content} onChange={e => setNewNewsItem({...newNewsItem, content: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Image (Optional)</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center justify-center px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-300">
                    <Upload className="w-4 h-4 mr-2" />
                    <span>Choose Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setNewsImageFile(e.target.files[0]);
                        }
                      }} 
                    />
                  </label>
                  {newsImageFile && (
                    <span className="text-sm text-zinc-400 truncate max-w-[200px]">{newsImageFile.name}</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Audio URL (Optional)</label>
                <input type="url" value={newNewsItem.audioUrl} onChange={e => setNewNewsItem({...newNewsItem, audioUrl: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Tags (comma separated)</label>
                <input type="text" value={newNewsItem.tags} onChange={e => setNewNewsItem({...newNewsItem, tags: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
              </div>
              {successMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium">
                  {successMessage}
                </div>
              )}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-semibold py-3 rounded-xl transition-colors mt-4 flex justify-center items-center"
              >
                {isSubmitting ? (editingNewsId ? 'Updating...' : 'Publishing...') : (editingNewsId ? 'Update News' : 'Publish News')}
              </button>
            </form>
          </div>
          
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold mb-6 flex items-center"><Newspaper className="w-5 h-5 mr-2 text-emerald-400" /> Published News</h2>
            {news.map(n => (
              <div key={n.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between group">
                <div>
                  <h3 className="font-semibold text-white text-lg">{n.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{n.content}</p>
                  <div className="flex items-center space-x-3 mt-3 text-xs text-zinc-500">
                    <span>{new Date(n.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditNewsClick(n)} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteNews(n.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {news.length === 0 && <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">No news published yet.</div>}
          </div>
        </div>
      )}
    </div>
  );
};
