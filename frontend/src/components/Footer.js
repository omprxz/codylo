import { Link } from 'react-router-dom';
import { FaInstagram, FaGithub, FaLinkedin } from "react-icons/fa6";

function Footer(){
  const currentYear = new Date().getFullYear();
  const copyrightNotice = `© ${currentYear} Codylo. All rights reserved.`;
  
  return(
    <>
      <div className='relative flex justify-center bg-black w-full rounded-tl-[30px] rounded-tr-[30px] overflow-hidden py-5 px-6'>
        <div className='absolute top-0 bg-gradient-to-b from-[#3a1c35] via-[#221b3a] to-black min-h-[25rem] w-full'></div>
        <div className='relative flex flex-col divide-y divide-gray-400 w-full'>
          {<div className='my-12'>
            <h1 className='text-center text-2xl font-black text-gray-200'>Codylo</h1>
            <p className='text-center text-[0.9rem] text-gray-500 mt-2'>Code 10x Faster With AI.</p>
            <div className="social flex gap-5 mt-3 justify-center">
              <a href="https://www.instagram.com/omprxz" target='_blank'><FaInstagram className='text-2xl text-gray-200' /></a>
              <a href="https://www.linkedin.com/in/omprxz" target='_blank'><FaLinkedin className='text-2xl text-gray-200' /></a>
              <a href="https://github.com/omprxz" target='_blank'><FaGithub className='text-2xl text-gray-200' /></a>
            </div>
          </div>}
          {
            <div className='grid grid-cols-2 py-12 text-gray-400 text-[0.9rem] place-items-center gap-4'>
              <Link to='#home'>Get Started</Link>
              <Link to='/code'>AI Code Tools</Link>
              <Link to='/about'>About</Link>
              <Link to='/fixcode'>Fix Bug</Link>
              <Link to='/generatecode'>Generate Code</Link>
              <Link to='/image2code'>Image to Code</Link>
            </div>
          }
          {
            <div className='py-12'>
              <p className='text-center text-[0.9rem] text-gray-200'>{copyrightNotice}</p>
            </div>
          }
        </div>
      </div>
    </>
    )
  
}


export default Footer