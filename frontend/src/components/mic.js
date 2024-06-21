import { useState, useRef } from 'react';
import { MdMicNone } from 'react-icons/md';
import './Mic.css';

const Mic = ({ className, iconClassName, setAlertMsg, setText }) => {
    const [micActive, setMicActive] = useState(false);
    const [micUsedAlready, setMicUsedAlready] = useState(false);
    const recognitionRef = useRef(null);

    const handleMic = () => {
        if (!('webkitSpeechRecognition' in window)) {
            setAlertMsg('Web Speech API is not supported in this browser.');
            return;
        }

        if (micActive) {
            recognitionRef.current.stop();
            setMicActive(false);
        } else {
          setMicActive(true)
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setMicActive(true);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (micUsedAlready) {
                    setText((prev) => prev + ' ' + transcript);
                } else {
                    setMicUsedAlready(true);
                    setText((prev) => prev + transcript);
                }
                setMicActive(false);
                setAlertMsg('');
            };

            recognition.onerror = (event) => {
                console.error(event.error);
                setMicActive(false);
                setAlertMsg('Error occurred in recognition: ' + event.error);
            };

            recognition.onend = () => {
                setMicActive(false);
                setAlertMsg('');
            };

            recognition.start();
            recognitionRef.current = recognition;
        }
    };

    return (
      <>
        <div className={`${className} ${micActive ? 'mic-containerAnimate' : ''}`}>
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
            <MdMicNone className={`${iconClassName} mic`} onClick={handleMic} />
        </div>
      </>
    );
};

export default Mic;