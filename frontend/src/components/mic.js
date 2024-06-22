import React, { useState, useRef } from 'react';
import { MdMicNone } from 'react-icons/md';
import styled, { keyframes, css } from 'styled-components';

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
      setMicActive(true);
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
    <MicContainer className={className} micActive={micActive} onClick={handleMic}>
      <Circle className="circle" />
      <Circle className="circle" />
      <Circle className="circle" />
      <MicIcon className={iconClassName} onClick={handleMic} />
    </MicContainer>
  );
};

const pulse = keyframes`
  0% {
    transform: scale(0.7);
  }
  50% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(0.7);
  }
`;

const MicContainer = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: hsla(224,84.7%,46.6%,0.179);
  position: absolute;
  ${({ micActive }) => micActive && css`
    .circle {
      animation: ${pulse} 2s ease-in-out infinite;
    }
  `}
`;

const Circle = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  border-radius: 50%;
  background-color: transparent;
  border: solid 1px hsl(224, 76.3%, 48%);
  z-index: 5;
  &:nth-child(2) {
    animation-delay: 0.5s;
  }
  &:nth-child(3) {
    animation-delay: 1s;
  }
`;

const MicIcon = styled(MdMicNone)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9;
`;


export default Mic;