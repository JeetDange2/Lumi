import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import SmartRoadmapPage from "./pages/SmartRoadmapPage";
import StudyPlannerPage from "./pages/StudyPlannerPage";
import PerformanceTrackerPage from "./pages/PerformanceTrackerPage";
import SocialPage from "./pages/SocialPage";
import SignupPage from "./pages/SignupPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/roadmap-generator" element={<SmartRoadmapPage />} />
        <Route path="/study-planner" element={<StudyPlannerPage />} />
        <Route path="/performance-tracker" element={<PerformanceTrackerPage />} />
        <Route path="/social" element={<SocialPage />} />
      </Routes>
    </Router>
  );
}

export default App;
