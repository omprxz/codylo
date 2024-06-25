import { FaCommentAlt, FaTimes } from 'react-icons/fa'
import {useState} from 'react';
import axios from 'axios';
import './feedback.css';

export default function FeedBack({ setIsFormOpen, isFormOpen, toggleNav }){
  const api_baseurl = window.location.hostname === "localhost" ? process.env.REACT_APP_API_BASEURL_LOCAL : process.env.REACT_APP_API_BASEURL_PRODUCTION;
  
  const [fbName, setFbName] = useState('')
  const [fbEmail, setFbEmail] = useState('')
  const [fbText, setFbText] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const [sucMsg, setSucMsg] = useState('')
  const [fbSending, setFbSending] = useState(false)
  
  const handleFeedbackToggle = () => {
    setIsFormOpen(!isFormOpen)
    toggleNav()
  }
  const handleFbValueChange = (e) => {
  const { id, value } = e.target;
  switch (id) {
    case 'name':
      setFbName(value);
      break;
    case 'email':
      setFbEmail(value);
      break;
    case 'msgText':
      setFbText(value);
      break;
    default:
      break;
  }
  if (errMsg) {
    setErrMsg('');
  }
};
  const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
  }
  
  const sendFeedback = async () => {
    setErrMsg('')
    setSucMsg('')
    if( !fbName || !fbEmail || !fbText){
      setErrMsg('All fields mandatory')
      return;
    }
    if(!validateEmail(fbEmail)){
      setErrMsg('Invalid email')
      return;
    }
    
    setFbSending(true)
  try {
    const response = await axios.post(`${api_baseurl}/api/sendFeedbackMail`, {
      name: fbName,
      email: fbEmail,
      text: fbText
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if(response.data.status === 'success'){
      setFbName('')
      setFbEmail('')
      setFbText('')
      setFbSending(false)
      setSucMsg("Feedback sent to om. Thanks")
      setTimeout(function() {
        setIsFormOpen(false)
        setSucMsg('')
        setErrMsg('')
      }, 2000);
    }else{
      throw "Error in sending email to om."
    }
  } catch (error) {
    setErrMsg('Failed to send email:', error.response ? error.response.data : error);
    setFbSending(false)
  }
    setFbSending(false)
  }
  return(
    <>
      <div className={`fixed mt-[-5rem] z-20 touch-none flex justify-center items-center min-h-screen min-w-full transition ease-in-out duration-200 ${ isFormOpen ? '' : 'opacity-0 pointer-events-none' }`}> 
        <div className='feedbackForm bg-gradient-to-b from-[#3a1c35] via-[#221b3a] to-black w-80 shadow shadow-gray-900 rounded-lg flex flex-col items-center px-7 pt-5 pb-7 gap-3'>
          <h1 className='text-center font-bold text-white text-2xl'>Give Feedback</h1>
            <input type="text" id="name" class="border-none text-sm rounded block w-full px-3 py-2.5 bg-black placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Name" value={fbName} onChange={handleFbValueChange} required />
            <input type="email" id="email" class="border-none text-sm rounded block w-full px-3 py-2.5 bg-black placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Email" value={fbEmail} onChange={handleFbValueChange} required />
            <textarea type="msgText" id="msgText" class="border-none text-sm rounded block w-full px-3 py-2.5 bg-black placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 min-h-[6.5rem]" placeholder="Suggestion" rows="5" value={fbText} onChange={handleFbValueChange} required></textarea>
            { errMsg && (<p className='text-red-600 text-sm'>{ errMsg }</p>) }
            { sucMsg && (<p className='text-green-500 text-sm'>{ sucMsg }</p>) }
            <button type='submit' className="border text-sm focus:ring-4 hover:ring-4 focus:outline-none font-medium rounded-sm px-4 py-2 text-center mb-2 mt-4 border-blue-400 text-blue-400 hover:ring-blue-900 focus:ring-blue-900" disabled={fbSending} onClick={sendFeedback}> { fbSending ? 'Please wait...': 'Send Feedback' }</button>
            <button className="focus:outline-none text-center text-red-600 mt-6 text-2xl" onClick={handleFeedbackToggle}> <FaTimes /> </button>
        </div>
      </div>
    </>
    );
}
