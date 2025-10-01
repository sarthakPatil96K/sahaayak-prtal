import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import VictimRegistration from './pages/VictimRegistration';
import OfficerDashboard from './pages/OfficerDashboard';
import TrackApplication from './pages/TrackApplication';
import HelpSupport from './pages/HelpSupport';
// Add this import
import OfficerLogin from './pages/OfficerLogin';

import GrievanceRedressal from './pages/GrievanceRedressal';

// Add to Routes
// Add import
import InterCasteMarriage from './pages/InterCasteMarriage';

// Add to Routes


function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<VictimRegistration />} />
            <Route path="/officer" element={<OfficerDashboard />} />
            <Route path="/track" element={<TrackApplication />} />
            <Route path="/help" element={<HelpSupport />} />
           <Route path="/intercaste-marriage" element={<InterCasteMarriage />} />
<Route path="/officer-login" element={<OfficerLogin />} />
<Route path="/grievance" element={<GrievanceRedressal />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;