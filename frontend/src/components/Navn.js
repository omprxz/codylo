import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";
import { FaBars } from "react-icons/fa6";
import Feedback from './feedback.js'

function Nav() {
  const [showNav, setShowNav] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  const toggleNav = () => {
    setShowNav(!showNav)
  }
  
  const handleFeedbackToggle = () => {
    setIsFormOpen(!isFormOpen)
    toggleNav()
  }
  return (
    <>
      <div className='h-14 backdrop-blur-sm sticky top-0 bg-transparent text-white flex flex-nowrap justify-between items-center px-5 z-20'>
        <FaBars className={`relative text-white text-2xl transition-all duration-[600ms] ease-in-out text-gray-200 ${showNav ? '-left-full' : 'left-0'}`} onClick={toggleNav} />
        <Link to='/code' className='font-black text-3xl text-gray-200'>Codylo</Link>
      </div>
      <Feedback isFormOpen={isFormOpen} setIsFormOpen={setIsFormOpen} toggleNav={toggleNav} />
      <div className={`fixed transition-all duration-[600ms] top-0 z-20 ease-in-out ${showNav ? 'left-0' : 'left-[-100%]'} w-60 min-h-screen touch-none`}>
       <div className="absolute blur-md inset-1 bg-gradient-to-br from-pink-500 to-purple-500 opacity-70"></div>
       <div className='relative min-h-screen bg-black pt-3 ps-2 opacity-90'>
       <FaArrowLeft className={`text-white text-2xl relative left-[78%] mt-2`} onClick={toggleNav} />
       <img src="logo512.png" className='w-24' />
       <ul className='ease-in-out text-white list-none ps-5 pe-4'>
        <Link to='/' className='rounded px-2 py-1.5 transition-all duration-200 hover:bg-black hover:ps-3 block' onClick={toggleNav}>Home</Link>
        <Link to='/code' className='mt-6 rounded px-2 py-1.5 transition-all duration-200 hover:bg-black hover:ps-3 block' onClick={toggleNav}>Tools</Link>
        <Link to='/generatecode' className='mt-6 rounded px-2 py-1.5 transition-all duration-200 hover:bg-black hover:ps-3 block' onClick={toggleNav}>Generate code</Link>
        <Link to='/fixcode' className='mt-6 rounded px-2 py-1.5 transition-all duration-200 hover:bg-black hover:ps-3 block' onClick={toggleNav}>Bug fixer</Link>
        <Link to='/image2code' className='mt-6 rounded px-2 py-1.5 transition-all duration-200 hover:bg-black hover:ps-3 block' onClick={toggleNav}>Image to code</Link>
        <Link className='mt-6 rounded px-2 py-1.5 transition-all duration-200 hover:bg-black hover:ps-3 block' onClick={handleFeedbackToggle}>Feedback</Link>
        <Link to='/about' className='mt-6 rounded px-2 py-1.5 transition-all duration-200 hover:bg-black hover:ps-3 block' onClick={toggleNav}>About</Link>
       </ul>
       </div>
      </div>
    </>
  );
}

export default Nav;