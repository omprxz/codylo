import React, {
  useState,
  useEffect
} from 'react'
import Code_Block from './codeBlock.js';
import axios from 'axios';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold
} from "@google/generative-ai";
import {
  tomorrowNightBright
} from 'react-code-blocks';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'animate.css';
import {
  fixCodePrompt
} from './prompts.js';
import ReactMarkdown from 'react-markdown';
import {
  FaRegClipboard,
  FaClipboardCheck
} from "react-icons/fa6";
import Gemini from './gemini.js';

function FixBug() {

  let geminiErr = 0
  const [fixing,
    setFixing] = useState(false)
  const [alertMsg,
    setAlertMsg] = useState('')
  const [language,
    setLanguage] = useState([]);
  let languageLower = language.length > 0 ? language[0].toLowerCase() : 'clike';
  let languageToUse = Prism.languages[languageLower] ? languageLower: 'clike';
  const [syntaxLanguage,
    setSyntaxLanguage] = useState(languageToUse);
  const [errorCode,
    setErrorCode] = useState(false)
  const [code,
    setCode] = useState('');
  const [fixedCode,
    setFixedCode] = useState('');
  const [codeIssue,
    setCodeIssue] = useState('');
  const [resultsVisib,
    setResultsVisib] = useState(false)
  const [pasted,
    setPasted] = useState(false)
  const [fixes,
    setFixes] = useState('')


  const handleCode = (value) => {
    setCode(value)
    if (value != '') {
      setAlertMsg('')
    }
  }
  const handleCodeIssue = (event) => {
    setCodeIssue(event.target.value)
  }
  const handleLanguage = (event) => {
    const selectedLanguages = Array.from(event.target.selectedOptions, option => option.value);
    setLanguage(selectedLanguages);

    languageLower = selectedLanguages.length > 0 ? selectedLanguages[0].toLowerCase(): 'clike';
  const languageMap = {
    'mysql': 'sql',
    'node.js': 'javascript',
    'vue.js': 'javascript',
    'react': 'javascript',
    'angular': 'javascript',
    'react native': 'javascript',
    'laravel': 'clike',
    'django': 'python',
    'flask': 'python'
  };

  const languageToUse = Prism.languages[languageMap[languageLower] || languageLower] ? languageMap[languageLower] || languageLower : 'clike';
    
    setSyntaxLanguage(languageToUse)
  }

  const handleChunk = (chunk) => {
    setFixedCode((prevChunk) => prevChunk + chunk);
  }

  const handlePaste = async () => {
    try {
      const clipboardData = await navigator.clipboard.readText();
      setCode(clipboardData);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
    setPasted(true)
    setTimeout(() => setPasted(false), 1000)
  }

  const getPart = (prompt) => {
    const parts = [
      {
      text: "You are a skilled code assistant specialized in debugging and fixing code. Your languages of choice are ${languages}. Your task is to identify and fix bugs in the given code, and then specify the fixes in a markdown code block.\n\nInstructions:\n- Code: \\`\\`\\`\\n${code}\\n\\`\\`\\`\n- Issues to Fix: ${codeIssue !== '' ? `${codeIssue} (only fix these)` : 'Identify and fix all issues'}\n- Languages of this code: ${languages} (or detect if not appropriate)\n- Requirements (MUST):\n  - Keep the code flawless and in one go so that I don't have to make the request again to save my tokens.\n  - After the corrected code, specify the fixes in a markdown code block (.md type) (include only top 15 fixes at max).\n  - Perform proper error handling if needed.\n  - Don't change anything else or any other syntax in code which have no error or bugs\n  - Keep the corrected code and fixed bugs details in two completely different code blocks.\n  - if the asked question is irrelevant give the response as short as possible in just a single paragraph within 50 words\n  - Adhere to all instructions and rules given to you strictly.\n\nExample format:\n>>\n\\`\\`\\`{language}\n// Corrected code here...\n\\`\\`\\`\n\nFixes:\n\\`\\`\\`markdown\n- [✔] Fixed Issue 1\n- [✔] Fixed Issue 2\n\\`\\`\\`\n<<"
    },
      {
        text: "input: You are a skilled code assistant specialized in debugging and fixing code. Your languages of choice are Python. Your task is to identify and fix bugs in the given code, and then specify the fixes in a markdown code block.\n\nInstructions:\n- Code: \`\`\`\ndef add(x, y):\n    return x * y\n\ndef subtract(x, y):\n    return x - y\n\ndef multiply(x, y):\n    return x * y\n\ndef divide(x, y):\n    if y == 0:\n        return \"Error! Division by zero.\"\n    else:\n        return x / y\n\nprint(\"Select operation:\")\nprint(\"1. Add\")\nprint(\"2. Subtract\")\nprint(\"3. Multiply\")\nprint(\"4. Divide\")\n\nwhile True:\n    choice = input(\"Enter choice (1/2/3/4): \")\n\n    if choice in ('1', '2', '3', '4'):\n        num1 = float(input(\"Enter first number: \"))\n        num2 = float(input(\"Enter second number: \"))\n\n        if choice == '1':\n            print(\"Result:\", add(num1, num2))\n        elif choice == '2':\n            print(\"Result:\", subtract(num1, num2))\n        elif choice == '3':\n            print(\"Result:\", multiply(num1, num2))\n        elif choice == '4':\n            print(\"Result:\", divide(num1, num2))\n        break\n    else:\n        print(\"Invalid Input\")\n\`\`\`\n- Issues to Fix: when i am opting 1 it multplies the two numbers (only fix these)\n- Languages of this code: Python (or detect if not appropriate)\n- Requirements (MUST):\n  - Keep the code flawless and in one go so that I don't have to make the request again to save my tokens.\n  - After the corrected code, specify the fixes in a markdown code block (.md type) (include only top 15 fixes at max).\n  - Perform proper error handling if needed.\n  - Don't change anything else or any other syntax in code which have no error or bugs\n  - Keep the corrected code and fixed bugs details in two completely different code blocks.\n  - if the asked question is irrelevant give the response as short as possible in just a single paragraph within 50 words\n  - Adhere to all instructions and rules given to you strictly.\n\nExample format:\n>>\n\`\`\`{language}\n// Corrected code here...\n\`\`\`\n\nFixes:\n\`\`\`markdown\n- [✔] Fixed Issue 1\n- [✔] Fixed Issue 2\n\`\`\`\n<<"
      },
      {
        text: "output: ## Corrected Code \n\n\`\`\`python\ndef add(x, y):\n  return x + y  # Use addition operator for sum\n\ndef subtract(x, y):\n  return x - y\n\ndef multiply(x, y):\n  return x * y\n\ndef divide(x, y):\n  if y == 0:\n    return \"Error! Division by zero.\"\n  else:\n    return x / y\n\nprint(\"Select operation:\")\nprint(\"1. Add\")\nprint(\"2. Subtract\")\nprint(\"3. Multiply\")\nprint(\"4. Divide\")\n\nwhile True:\n  choice = input(\"Enter choice (1/2/3/4): \")\n\n  if choice in ('1', '2', '3', '4'):\n    num1 = float(input(\"Enter first number: \"))\n    num2 = float(input(\"Enter second number: \"))\n\n    if choice == '1':\n      print(\"Result:\", add(num1, num2))\n    elif choice == '2':\n      print(\"Result:\", subtract(num1, num2))\n    elif choice == '3':\n      print(\"Result:\", multiply(num1, num2))\n    elif choice == '4':\n      print(\"Result:\", divide(num1, num2))\n    break\n  else:\n    print(\"Invalid Input\")\n\`\`\`\n\nFixes\n\n\`\`\`markdown\n- [✔] Fixed the `add` function to use the `+` operator for addition instead of `*` (multiplication).\n\`\`\`"
      },
      {
        text: "input: " + prompt
      },
      {
        text: "output: "
      },
    ];
    return parts;
  }

  const fixCode = async () => {
    if (code == '') {
      setAlertMsg('Code is empty.')
      return;
    }
    setErrorCode(false)
    let prompt = fixCodePrompt(code, codeIssue, ...language)
    const parts = getPart(prompt);
    const model = "gemini-1.5-flash";
    const codeRegEx = /\`\`\`(\w+)\s([\s\S]*?)\`\`\`/g;
    const fixesRegEx = /\`\`\`markdown\s([\s\S]*?)\`\`\`/g;

    try {
      setFixing(true)
      setFixes('')
      setResultsVisib(false)
      setFixedCode('')

      let response = await Gemini(parts, geminiErr, setErrorCode, setResultsVisib, handleChunk, true, model);
      let result = response

      let matchCode = codeRegEx.exec(result)
      let rawCode;
      if (matchCode) {
        rawCode = matchCode[2]
        setSyntaxLanguage(matchCode[1])
      } else {
        if (response.includes('Internal') && response.includes('500')) {

          let response = await Gemini(parts, geminiErr, setErrorCode, setResultsVisib, handleChunk, true, model);

          let result = response

          let matchCode = codeRegEx.exec(result)
          let rawCode;
          if (matchCode) {
            rawCode = matchCode[2]
            setSyntaxLanguage(matchCode[1])
          } else {
            rawCode = response
            setSyntaxLanguage('plaintext')
          }

        } else {
          rawCode = response
          setSyntaxLanguage('plaintext')
        }
      }
      setFixedCode(rawCode.replace(/^\s*\n/gm, ''))

      let matchFixes = fixesRegEx.exec(result)
      if (matchFixes) {
        setFixes(matchFixes[1])
      }

      setFixing(false)
    } catch (e) {
      console.error(e)
      setFixing(false)
      if (geminiErr != 1) {
        setFixedCode(e)
      }
    }
  }
  return(
    <>
      <div className='flex flex-col align-middle p-2 gap-3 pb-20'>
        <h1 className="font-bold mt-3 mb-2 text-2xl text-green-300 text-center">Fix Error/Bug in a Code</h1>
        <div>
          <span className="text-white">Select languages:</span>
          <select id="language" className="form-multiselect block w-full px-4 py-2 mt-1 rounded-md bg-gray-800 text-white border-none focus:outline-none focus:bg-gray-800" multiple value={language} onChange={handleLanguage}>
            <option value="" disabled>Select languages</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="C">C</option>
            <option value="C++">C++</option>
            <option value="C#">C#</option>
            <option value="Ruby">Ruby</option>
            <option value="PHP">PHP</option>
            <option value="Go">Go</option>
            <option value="Swift">Swift</option>
            <option value="Kotlin">Kotlin</option>
            <option value="Rust">Rust</option>
            <option value="HTML">HTML</option>
            <option value="CSS">CSS</option>
            <option value="TypeScript">TypeScript</option>
            <option value="Node.js">Node.js</option>
            <option value="React">React</option>
            <option value="Angular">Angular</option>
            <option value="Vue.js">Vue.js</option>
            <option value="Django">Django</option>
            <option value="Flask">Flask</option>
            <option value="Laravel">Laravel</option>
            <option value="R">R</option>
            <option value="Julia">Julia</option>
            <option value="Scala">Scala</option>
            <option value="MATLAB">MATLAB</option>
            <option value="Flutter">Flutter</option>
            <option value="React Native">React Native</option>
            <option value="SQL">SQL</option>
            <option value="MySQL">MySQL</option>
            <option value="Assembly Language">Assembly Language</option>
            <option value="Lua">Lua</option>
            <option value="Solidity">Solidity</option>
          </select>
        </div>
        <div className='relative'>
          { pasted ? (<FaClipboardCheck className='absolute top-2 right-2 text-white z-10 text-[1.2rem]' onClick={handlePaste} />):
          (<FaRegClipboard className='absolute top-2 right-2 text-white z-10 text-[1.2rem]' onClick={handlePaste} />)
          }
          <div className="max-h-[30rem] overflow-y-scroll">
            <Editor
              value={code}
              onValueChange={handleCode}
              highlight={(code) => Prism.highlight(code, Prism.languages[syntaxLanguage], syntaxLanguage)}
              padding={10}
              placeholder={`Paste Your${language[0] != undefined ? ' '+language[0] : ''} Code Here...`}
              style={ {
                backgroundColor: tomorrowNightBright.backgroundColor,
                color: '#f8f8f2',
                fontFamily: '"Fira Code", "Fira Mono", monospace',
                fontSize: '14px',
                lineHeight: '1.5em'
              }}
              className={`editor rounded border-none outline-none w-full min-h-[12rem] ${alertMsg != '' ? 'animate__animated animate__headShake': ''}`}
              />
          </div>
          <p className="text-red-600 ms-1 mt-1">
            {alertMsg}
          </p>
        </div>
        <textarea id="codeIssue" rows="3" placeholder="Describe the issues (Leave empty to fix whole code)..." className={`form-textarea block w-full px-4 py-2 rounded-md bg-gray-800 text-white focus:outline-none focus:bg-gray-800 border-none`} value={codeIssue} onChange={handleCodeIssue}></textarea>
        <div className="text-center mt-2">
          <button className="border w-1/2 focus:ring-4 hover:ring-4 focus:outline-none font-medium rounded-sm px-5 py-2.5 text-center mb-2 border-green-400 text-green-400 hover:ring-green-900 focus:ring-green-900" disabled={fixing} onClick={fixCode}> { fixing ? 'Fixing...': 'Fix Code' }</button>
        </div>

        { resultsVisib && (<div className="results">
          <Code_Block initialCode={fixedCode} language={syntaxLanguage} hasError={errorCode} showFileName={false} />

          {
          fixes != '' ?
          (<div className="mx-3 px-4 py-3 rounded bg-black text-white mb-5">
            <span className="text-white">Fixes overview:</span> <br /> <br />
          <ReactMarkdown>
            {fixes}
          </ReactMarkdown>
        </div>
        ): ''
        }

      </div>
    )
    }

  </div>
</>
);
}

export default FixBug;