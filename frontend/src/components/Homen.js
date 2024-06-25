import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRightLong } from "react-icons/fa6";
import { IoChevronDownSharp } from "react-icons/io5";
import Footer from './Footer.js'

function Home(){
  
  const faqs = [
  {
    question: "What is Codylo?",
    answer: "Codylo is an AI-driven platform designed to enhance the coding experience by offering tools for code generation, bug detection, bug fixing, and image-to-code conversion and much more."
  },
  {
    question: "How does Codylo generate code from commands?",
    answer: "Codylo uses natural language processing (NLP) to understand user commands and generate corresponding code snippets in various programming languages."
  },
  {
    question: "Can Codylo fix bugs in my code automatically?",
    answer: "Yes, Codylo can analyze your code, identify bugs, and suggest or apply fixes using advanced machine learning algorithms."
  },
  {
    question: "What programming languages does Codylo support?",
    answer: "Codylo supports a wide range of programming languages, including but not limited to Python, JavaScript, Java, C++, and more."
  },
  {
    question: "How does Codylo convert images to code?",
    answer: "Codylo uses image recognition and machine learning techniques to interpret the content of an image and generate relevant code."
  },
  {
    question: "Is Codylo suitable for beginner programmers?",
    answer: "Absolutely! Codylo is designed to be user-friendly and provides extensive support to help beginners understand and write code efficiently."
  },
  {
    question: "Can Codylo integrate with existing development environments?",
    answer: "No, Currently Codylo doesn't support integration."
  },
  {
    question: "Is there a limit to the size of the codebase Codylo can handle?",
    answer: "Codylo is capable of handling projects of various sizes, from small scripts to large-scale applications upto more than 1 million words, thanks to its robust infrastructure."
  },
  {
    question: "How secure is my code when using Codylo?",
    answer: "Codylo prioritizes security and employs encryption and secure protocols to ensure your code and data are protected."
  },
  {
    question: "Can Codylo help with code optimization?",
    answer: "Yes, Codylo can analyze your code for performance bottlenecks and suggest optimizations to improve efficiency."
  },
  {
    question: "Is Codylo available as a standalone application or a web service?",
    answer: "Codylo is currently available as a web-based service only."
  },
  {
    question: "How does Codylo keep up with the latest programming trends and technologies?",
    answer: "Codylo’s development team continuously updates the platform to incorporate the latest advancements in AI, programming languages, and development practices."
  }
];
  
const [openIndexes, setOpenIndexes] = useState([]);

  const toggleFAQ = (index) => {
    setOpenIndexes((prev) => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };
  return(
    <>
      <div className='relative homeDiv min-h-screen' id='home' >
      
        <div className="absolute bg-gradient-to-r from-pink-500 to-purple-500 inset-0 blur-lg opacity-10 min-h-screen"></div>
        
        {
        <div className='relative grid place-items-center outline-blue-800'>
        {
          <div className='relative mt-16'>
          <div className="absolute bg-gradient-to-r from-pink-500 to-purple-500 rounded-full inset-0 blur-sm"></div>
          <p className='relative rounded-full border-[0.5px] border-gray-300 bg-black px-4 py-1.5 text-white text-sm'>AI Code Assistant</p>
        </div>}
        
        <h1 className='font-bold text-white text-[3.3rem] text-center mt-8 px-2 leading-[1.25]'>
          Code 10x Faster With AI
        </h1>
        <p className='text-center text-gray-500 mt-5 px-6 text-[1.15rem]'>Codylo transform complex tasks into simple actions, saving you valuable time and energy. Write cleaner, more efficient code with Codylo by your side.</p>
        <div className='text-center mt-12'>
          <Link to='code' className='bg-white text-black px-5 py-2.5 rounded-xl flex items-center font-bold shadow shadow-pink-400'>Get Started <FaArrowRightLong className='inline-block ms-3' /></Link>
        </div>
        
        {
        <div className="hiworks relative flex flex-col items-center rounded-tl-[40px] rounded-tr-[40px] w-full mt-24 overflow-hidden bg-black">
        {
        <div className='relative w-full flex justify-center'>
          <div className='relative mt-10'>
            <div className="absolute bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mx-auto inset-0.5 blur-sm"></div>
            <p className='relative rounded-full border-[0.5px] border-gray-300 bg-black px-4 py-1.5 text-white text-sm'>Coding Simplified</p>
          </div>
        </div>
        }
        <h1 className='font-bold text-white text-4xl text-center mt-8 px-2 leading-[1.25]'>
          How it Works
        </h1>
        <p className='text-center text-gray-500 mt-5 px-6'>Code Like a Machine</p>
        {
        <div className="cards flex flex-col items-center gap-5 mt-8 px-6 pt-6">
        
        {
          <div className='card border-[0.7px] border-gray-400 rounded-lg w-full px-8 pb-6'>
          <div className='flex justify-center relative pb-0 mb-0 h-36'>
            <img className='w-40 absolute -translate-y-[28%]' src="home-circle.webp" />
          </div>
          <h2 className='font-bold text-xl text-white mb-5'>Code Faster With AI</h2>
          <p className='text-gray-500 text-[0.94rem]'>Our AI helps as you code, offering instant fixes and writing code for you. It makes coding faster and simpler.</p>
        </div>
        }
        {
          <div className='card border-[0.7px] border-gray-400 rounded-lg w-full px-8 pb-6'>
          <div className='flex justify-center relative pb-0 mb-0 h-36'>
            <img className='w-40 absolute -translate-y-[28%]' src="home-cone.webp" />
          </div>
          <h2 className='font-bold text-xl text-white mb-5'>Fix and Review Code</h2>
          <p className='text-gray-500 text-[0.94rem]'>Our AI helps as you code, offering instant fixes and writing code for you. It makes coding faster and simpler.</p>
        </div>
        }
        {
        <div className='card border-[0.7px] border-gray-400 rounded-lg w-full px-8 pb-6'>
          <div className='flex justify-center relative pb-0 mb-0 h-36'>
            <img className='w-40 absolute -translate-y-[28%]' src="home-cylin.webp" />
          </div>
          <h2 className='font-bold text-xl text-white mb-5'>Easy interface</h2>
          <p className='text-gray-500 text-[0.94rem]'>Take charge with a user-friendly interface that puts you in command.</p>
        </div>
        }
        
        </div>
        }
        
        </div>
        }
        
        {
          <div className='wwhere mt-16 w-full px-6'>
          <p className='text-gray-500 mb-4'>Why we exist?</p>
          
          <p className='font-bold text-[1.65rem] text-gray-100 inline'>Codylo is here to revolutionize the coding experience with advanced AI-driven tools. </p>
          <p className='font-bold text-[1.65rem] text-gray-100 inline opacity-50'>It simplifies code generation from commands, automates bug detection and fixing, and even converts images to code. </p>
          <p className='font-bold text-[1.65rem] text-gray-100 inline'>Codylo's suite of features enhances productivity and efficiency for developers. </p>
          <p className='font-bold text-[1.65rem] text-gray-100 inline opacity-50'>By leveraging AI, Codylo aims to make coding more accessible and error-free.</p>
          
          </div>
        }
        
        {
          <div className="faqs relative mb-10 grid place-items-center mt-24">
          {
          <div className='relative'>
          <div className="absolute bg-gradient-to-r from-pink-500 to-purple-500 rounded-full inset-0.5 blur-sm"></div>
          <p className='relative rounded-full border-[0.5px] border-gray-300 bg-black px-4 py-1.5 text-white text-sm'>FAQ</p>
        </div>}
          <h1 className='font-extrabold text-[2.75rem] text-white mt-4 text-center leading-[1.25]'>Frequently Asked Questions</h1>
          <p className='text-gray-500 text px-6 text-center mt-4'>Straightforward answers to frequently asked questions.</p>
          
         {/* <div className="qnas mt-8 px-6 w-full">
          
          <div className="qna text-left px-3">
            <h2 className='text-white font-bold flex justify-between text-lg'><p>What is Codylo?</p> <IoChevronDownSharp className='text-xl text-pink-300 rotate-180' /></h2>
            <p className='text-[1.04rem] leading-[1.25] text-gray-400 mt-3'>
              Codylo is an AI-driven platform designed to enhance the coding experience by offering tools for code generation, bug detection, bug fixing, and image-to-code conversion.
            </p>
          </div>
          
          </div>*/}
          
    <div className="qnas mt-8 px-6 w-full divide-y divide-gray-400">
      {faqs.map((faq, index) => (
        <div key={index} className="qna text-left px-3 mb-4 pt-3">
          <h2 
            className='text-white font-bold flex justify-between text-lg cursor-pointer py-2 gap-1' 
            onClick={() => toggleFAQ(index)}
          >
            <p className='max-w-[90%]'>{faq.question}</p> 
            <IoChevronDownSharp 
              className={`text-xl text-pink-300 transition-transform duration-[400ms] ${openIndexes.includes(index) ? 'rotate-180' : 'rotate-0'}`} 
            />
          </h2>
          <div className={`transition-max-height duration-[400ms] overflow-hidden ${openIndexes.includes(index) ? 'max-h-screen' : 'max-h-0'}`}>
            <p className='text-[1.04rem] leading-[1.25] text-gray-400 mt-3'>
              {faq.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
          
          </div>
        }
        
        </div>
        }
        
        <Footer />
      </div>
    </>
    )
}

export default Home