import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LogIn from "./LogIn"; // Corrected casing
import Dashboard from "./Dashboard"; // Main app

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LogIn />} /> {/* Show login first */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* Show dashboard after login */}
      </Routes>
    </Router>
  );
}

export default App;
