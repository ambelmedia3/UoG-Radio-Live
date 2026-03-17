import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Archive } from './pages/Archive';
import { Schedule } from './pages/Schedule';
import { News } from './pages/News';
import { Chatbot } from './pages/Chatbot';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { ProgramDetails } from './pages/ProgramDetails';

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="archive" element={<Archive />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="news" element={<News />} />
              <Route path="chatbot" element={<Chatbot />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="admin" element={<Admin />} />
              <Route path="program/:id" element={<ProgramDetails />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PlayerProvider>
    </AuthProvider>
  );
}
