import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

interface ScheduleItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  host: string;
}

export const Schedule: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'schedules'), orderBy('startTime', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: ScheduleItem[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as ScheduleItem);
      });
      setSchedules(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-full bg-zinc-950 text-white p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Broadcast Schedule</h1>
            <p className="text-zinc-400">Upcoming programs on the Knowledge Archive.</p>
          </div>
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
            <Calendar className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="space-y-4">
          {schedules.length > 0 ? (
            schedules.map((item) => (
              <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between hover:border-zinc-700 transition-colors group">
                <div className="flex-1 mb-4 md:mb-0">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-zinc-400">
                    <span className="flex items-center"><User className="w-4 h-4 mr-1.5" /> {item.host || 'TBA'}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-800 shrink-0">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{format(new Date(item.startTime), 'h:mm a')} - {format(new Date(item.endTime), 'h:mm a')}</p>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{format(new Date(item.startTime), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-3xl">
              <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No upcoming programs</h3>
              <p className="text-zinc-500">Check back later for the updated schedule.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
