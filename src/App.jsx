
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import DevAdminPage from '@/pages/DevAdminPage';
import TutorialPage from '@/pages/TutorialPage';
import { keepAliveService } from '@/services/apiService';

function App() {
  // تفعيل keep-alive للباكند عند تحميل التطبيق
  useEffect(() => {
    const keepAliveInterval = keepAliveService.start();
    
    // إيقاف keep-alive عند إغلاق التطبيق
    return () => {
      keepAliveService.stop(keepAliveInterval);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dev-admin" element={<DevAdminPage />} />
        <Route path="/how-to-start" element={<TutorialPage />} />
      </Routes>
    </Router>
  );
}

export default App;
  