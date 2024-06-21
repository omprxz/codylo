import { FaCommentAlt, FaTimes } from 'react-icons/fa'
import {useState} from 'react';
import axios from 'axios';
import './feedback.css';

export default function FeedBack(){
  const api_baseurl = window.location.hostname === "localhost" ? process.env.REACT_APP_API_BASEURL_LOCAL : process.env.REACT_APP_API_BASEURL_PRODUCTION;
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [fbName, setFbName] = useState('')
  const [fbEmail, setFbEmail] = useState('')
  const [fbText, setFbText] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const [sucMsg, setSucMsg] = useState('')
  const [fbSending, setFbSending] = useState(false)
  
  const handleFeedbackToggle = () => {
    setIsFormOpen(!isFormOpen)
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
    if(response.data.status == 'success'){
      setFbName('')
      setFbEmail('')
      setFbText('')
      setFbSending(false)
      setSucMsg("Feedback sent to om. Thanks")
      setTimeout(function() {
        setIsFormOpen(false)
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
      <div>
        <span className={`text-white bg-gray-600 px-3 py-1 rounded z-30 fixed right-6 bottom-6 inline-block transition ease-in-out duration-300 ${ isFormOpen ? 'opacity-0 pointer-events-none' : '' }`} onClick={handleFeedbackToggle}><FaCommentAlt className='inline-block' /> Feedback</span>
      </div>
      <div className={`fixed mt-[-5rem] z-20 flex justify-center items-center min-h-screen min-w-full transition ease-in-out duration-300 ${ isFormOpen ? '' : 'opacity-0 pointer-events-none' }`}> 
        <div className='feedbackForm w-80 shadow-md shadow-slate-800 rounded-lg flex flex-col items-center px-7 pt-5 pb-7 gap-3'>
          <h1 className='text-center font-bold text-white text-2xl'>Give Feedback</h1>
            <input type="text" id="name" class="border text-sm rounded block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Name" value={fbName} onChange={handleFbValueChange} required />
            <input type="email" id="email" class="border text-sm rounded block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Email" value={fbEmail} onChange={handleFbValueChange} required />
            <textarea type="msgText" id="msgText" class="border text-sm rounded block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Suggestion" rows="5" value={fbText} onChange={handleFbValueChange} required></textarea>
            { errMsg && (<p className='text-red-600 text-sm'>{ errMsg }</p>) }
            { sucMsg && (<p className='text-green-500 text-sm'>{ sucMsg }</p>) }
            <button type='submit' className="border text-sm focus:ring-4 hover:ring-4 focus:outline-none font-medium rounded-sm px-4 py-2 text-center mb-2 mt-4 border-blue-400 text-blue-400 hover:ring-blue-900 focus:ring-blue-900" disabled={fbSending} onClick={sendFeedback}> { fbSending ? 'Please wait...': 'Send Feedback' }</button>
            <button className="focus:outline-none text-center text-red-600 mt-6 text-2xl" onClick={handleFeedbackToggle}> <FaTimes /> </button>
        </div>
      </div>
    </>
    );
}
