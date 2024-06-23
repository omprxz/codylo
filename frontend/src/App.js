import GenerateCode from './components/codeGenerator';
import { Analytics } from "@vercel/analytics/react"
import FixBug from './components/bugFixer';
import React, {useEffect} from 'react';
import { Link, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Nav from './components/nav';
// import Screen1 from './components/home2';
import Home from './components/home';
import About from './components/pages/about';
import FeedBack from './components/feedback';
import Image2Code from './components/Image2Code';
import TicTacToe from './components/fun/tictactoe';
import Page404 from './components/pages/error';
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
      <div className="pt-0 mt-0 bg-gray-900 min-h-screen">
      <Nav />
      <FeedBack/>
      <Analytics/>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/generatecode" element={<GenerateCode />} />
          <Route path="/fixcode" element={<FixBug />} />
          <Route path="/image2code" element={<Image2Code />} />
          <Route path="/fun/ttt" element={<TicTacToe />} />
          <Route path="*" element={<Page404 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
