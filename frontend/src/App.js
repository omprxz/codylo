import GenerateCode from './components/codeGenerator';
import FixBug from './components/bugFixer';
import React, {useEffect} from 'react';
import { Link, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Nav from './components/nav';
import Home from './components/home';
import About from './components/about';
import FeedBack from './components/feedback';
import Image2Code from './components/Image2Code';
import TicTacToe from './components/fun/tictactoe';

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
      <FeedBack />
        
        <Routes>
          <Route path="/" element={<Home />} />
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
