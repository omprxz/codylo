import { Link } from "react-router-dom";
import Footer from './Footer.js'
import { RiAiGenerate } from "react-icons/ri";
import { MdOutlineAutoFixHigh } from "react-icons/md";
import { IoImageOutline } from "react-icons/io5";

function Code(){
  const tools = [
    {
      sno: "01",
      name: "AI Code Generator",
      description: "Instantly generate code and complex algorithms with AI.",
      icon: RiAiGenerate,
      path: "/generatecode"
    },
    {
      sno: "02",
      name: "AI Code Bug Fixer",
      description: "Detect and fixes bugs in code, enhancing code quality and speeding up development.",
      icon: MdOutlineAutoFixHigh,
      path: "/fixcode"
    },
    {
      sno: "03",
      name: "AI Image to Code",
      description: "Converts visual designs into HTML, CSS & Javascript Code. It supports wide range of CSS frameworks.",
      icon: IoImageOutline,
      path: "/image2code"
    },
    ]
    
  return(
    <>
    <div className="relative codeDiv min-h-screen">
      <div className="absolute bg-gradient-to-r from-pink-500 to-purple-500 inset-0 blur-lg opacity-10 min-h-screen"></div>
      {
      <div className="relative flex flex-col items-center mb-16">
        <h1 className='text-center text-gray-100 font-black my-10 text-4xl'>Tools</h1>
        <div className='relative mb-3'>
          <div className="absolute bg-gradient-to-r from-pink-500 to-purple-500 rounded-full inset-0 blur-sm"></div>
          <p className='relative rounded-full border-[0.5px] border-gray-300 bg-black px-4 py-1.5 text-white text-sm'>Code with AI</p>
        </div>
        <p className="text-center my-6 text-gray-400 px-6 mb-12">Codylo writes code for you, finds and fixes mistakes instantly & much more. Make coding fast and easy. </p>
        {  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-6 place-items-center w-full mb-10">
        { tools.map((tool, index) => (
          <div key={index} className="rounded-2xl border border-gray-400 bg-transparent px-6 py-8 w-full shadow-md shadow-gray-700">
            <div className="flex justify-between">
              <tool.icon className="text-gray-400 text-6xl" />
              <span className="text-gray-400 text-2xl font-mono font-light">{tool.sno}</span>
            </div>
            <h2 className="font-bold text-gray-200 mt-10">{tool.name}</h2>
            <p className="text-gray-300 opacity-80 mt-2">{tool.description}</p>
            <p className='text-center mt-10'><Link to={tool.path} className="text-gray-300">Use now</Link></p>
          </div>
        ))
        }
        </div>
        }
      </div>
      }
    <Footer />
    </div>
    </>
    )
  
}
export default Code