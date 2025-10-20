
    import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import DevAdminPage from '@/pages/DevAdminPage';
import TutorialPage from '@/pages/TutorialPage';

function App() {
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
  