import { FaCommentAlt, FaTimes } from 'react-icons/fa'
import {useState} from 'react';
import axios from 'axios';

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
    const response = await axios.post(api_baseurl+'/api/sendFeedbackMail', {
      name: fbName,
      email: fbEmail,
      text: fbText
    });
    setSucMsg("Feedback sent to om. Thanks")
  } catch (error) {
    setErrMsg('Failed to send email:', error.response ? error.response.data : error.message);
    setFbSending(false)
  }
    setFbSending(false)
  }
  return(
    <>
      <div>
        <span className={`text-white bg-gray-600 px-3 py-1 rounded z-30 fixed right-6 bottom-6 inline-block transition ease-in-out duration-300 ${ isFormOpen ? 'opacity-0 pointer-events-none' : '' }`} onClick={handleFeedbackToggle}><FaCommentAlt className='inline-block' /> Give Feedback</span>
      </div>
      <div className={`fixed mt-[-5rem] z-20 flex justify-center items-center min-h-screen min-w-full transition ease-in-out duration-300 ${ isFormOpen ? '' : 'opacity-0 pointer-events-none' }`}> 
        <div className='w-80 bg-black shadow-lg rounded-lg flex flex-col items-center px-7 pt-5 pb-7 gap-3'>
          <h1 className='text-center font-bold text-white text-2xl'>Give Feedback</h1>
            <input type="text" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Name" value={fbName} onChange={handleFbValueChange} required />
            <input type="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Email" value={fbEmail} onChange={handleFbValueChange} required />
            <textarea type="msgText" id="msgText" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Suggestion" rows="5" value={fbText} onChange={handleFbValueChange} required></textarea>
            { errMsg && (<p className='text-red-600 text-sm'>{ errMsg }</p>) }
            { sucMsg && (<p className='text-green-500 text-sm'>{ sucMsg }</p>) }
            <button type='submit' className="text-blue-700 border border-blue-700 text-sm focus:ring-4 hover:ring-4 hover:ring-blue-300 focus:outline-none focus:ring-blue-300 font-medium rounded-sm px-4 py-2 text-center mb-2 mt-4 dark:border-blue-400 dark:text-blue-400 dark:hover:ring-blue-900 dark:focus:ring-blue-900" disabled={fbSending} onClick={sendFeedback}> { fbSending ? 'Please wait...': 'Send Feedback' }</button>
            <button className="text-red-700 focus:outline-none text-center  dark:text-red-600 mt-6 text-2xl" onClick={handleFeedbackToggle}> <FaTimes /> </button>
        </div>
      </div>
    </>
    );
}
