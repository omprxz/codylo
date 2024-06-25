import GenerateCode from './components/codeGenerator';
import { Analytics } from "@vercel/analytics/react"
import FixBug from './components/bugFixer';
import React, {useEffect, useRef, useState} from 'react';
import TopLoader from './components/TopLoader.js'
import { Link, BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
// import Nav from './components/nav';
// import Home from './components/home';
import Nav from './components/Navn';
import ScrollToTop from './components/ScrollToTop';
import Home from './components/Homen';
import Code from './components/Code';
import About from './components/pages/about';
import FeedBack from './components/feedback';
import Image2Code from './components/Image2Code';
import TicTacToe from './components/fun/tictactoe';
import Page404 from './components/pages/error.js';
import './App.css'

function App() {


  useEffect(() => {
    if (window.location.hostname === "localhost" || window.location.hostname.includes('192') && !window.eruda) {
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
      <ScrollToTop />
      <TopLoader />
      <div className="pt-0 mt-0 bg-black min-h-screen">
      <Nav />
      <Analytics/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/code" element={<Code />} />
          <Route path="*" element={<Page404 />} />
          <Route path="/about" element={<About />} />
          <Route path="/generatecode" element={<GenerateCode />} />
          <Route path="/fixcode" element={<FixBug />} />
          <Route path="/image2code" element={<Image2Code />} />
          <Route path="/fun/ttt" element={<TicTacToe />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
