import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Simple Home Page Component
const SimpleHomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-8">
            SGBAU Pre-Incubation Centre
          </h1>
          <h2 className="text-3xl mb-6">
            Sant Gadge Baba Amravati University
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Innovation Hub Management System
          </p>
          <div className="space-x-4">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-bold text-lg transition-colors">
              Get Started
            </button>
            <button className="border-2 border-white hover:bg-white hover:text-black text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple App Component
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SimpleHomePage />} />
          <Route path="*" element={<SimpleHomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
