import GenerateCode from './components/codeGenerator.js';
import FixBug from './components/bugFixer.js';
import React, {useEffect} from 'react';
import { Link, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Nav from './components/nav.js';
import Home from './components/home.js';

function App() {
  useEffect(() => {
    if (window.location.hostname === "localhost" && !window.eruda) {
        const script = document.createElement("script");
        script.src = "//cdn.jsdelivr.net/npm/eruda";
        document.body.appendChild(script);
        script.onload = () => {
            window.eruda.init();
        };
    }
}, []);

  return (
    <Router>
      <div className="pt-0 mt-0 bg-gray-900 min-h-screen">
      <Nav />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generatecode" element={<GenerateCode />} />
          <Route path="/fixcode" element={<FixBug />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
