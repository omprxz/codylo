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
import 'animate.css';
import { generateCodePrompt } from './prompts.js';

function GenerateCode() {
  const languageExtensions = {
    "JavaScript": ".js",
    "Python": ".py",
    "Java": ".java",
    "C": ".c",
    "C++": ".cpp",
    "C#": ".cs",
    "Ruby": ".rb",
    "PHP": ".php",
    "Go": ".go",
    "Swift": ".swift",
    "Kotlin": ".kt",
    "Rust": ".rs",
    "HTML": ".html",
    "CSS": ".css",
    "TypeScript": ".ts",
    "Node.js": ".js",
    "React": ".jsx",
    "Angular": ".ts",
    "Vue.js": ".vue",
    "Django": ".py",
    "Flask": ".py",
    "Laravel": ".php",
    "R": ".r",
    "Julia": ".jl",
    "Scala": ".scala",
    "MATLAB": ".m",
    "Java": ".java",
    "Kotlin": ".kt",
    "Swift": ".swift",
    "Flutter": ".dart",
    "React Native": ".js",
    "SQL": ".sql",
    "MySQL": ".sql",
    "Assembly Language": ".asm",
    "Lua": ".lua",
    "Solidity": ".sol"
  };
  const gemini_api = process.env.REACT_APP_GEMINI_API
  let geminiErr = 0

  const genAI = new GoogleGenerativeAI(gemini_api);

  const [code,
    setCode] = useState('');
  const [filename,
    setFileName] = useState('App.js');
  const [language,
    setLanguage] = useState('JavaScript');
  const [syntaxLanguage,
    setSyntaxLanguage] = useState('JavaScript');
  const [user_prompt,
    setUser_prompt] = useState('');
  const [comments_preference,
    setComments_preference] = useState('without comments');
  const [resultsVisib,
    setResultsVisib] = useState(false)
  const [errorCode,
    setErrorCode] = useState(false)
  const [generating,
    setGenerating] = useState(false)
  const [alertMsg,
    setAlertMsg] = useState('')

  const handleLanguage = (event) => {
    setLanguage(event.target.value)
  }
  const handleCPref = (event) => {
    setComments_preference(event.target.value)
  }
  const handleUserPrompt = (event) => {
    setUser_prompt(event.target.value)
    if(event.target.value != ''){
      setAlertMsg('')
    }
  }

  const getCodeFromGemini = async (prompt, model = "gemini-1.5-flash") => {
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8000,
      responseMimeType: "text/plain",
    };

    const parts = [
      {
      text: "You are a helpful code assistant that can teach a junior developer how to code. Your language of choice is ${language}. Don't explain the code, just generate the code block itself.\n    Write flawless code with the following instructions and requirements:\n    - What I want: ${user_prompt}\n    - Write the code in ${language}\n    - Comments preference: Give the code ${comments_preference}\n    - Do not give further explanation of the code you generated because it will cost me more tokens.\n    - Keep the code flawless and in one go so that I don't have to make the request again to save my tokens.\n    - Provide the code in the respective language code block.\n    - After the main code block, suggest a filename in a JSON code block inside the 'filename' key.\n    - Do proper error handling if required.\n    - Adhere to all instructions and rules given to you strictly.\n    - example of output format\n    >>\n    ```{language}\n    code goes here....\n    ```\n\n    Suggested filename is:\n    ```json\n    {\n    filename: \"suggested file name with extension\"\n    }\n    ```\n    <<\n    - keep the main code and suggest file in two completely different code blocks \n - if the asked question is irrelevant give the response as short as possible in just single paragraph withing 50 words"
    },
      {
        text: "input: You are a helpful code assistant that can teach a junior developer how to code. Your language of choice is php. Don't explain the code, just generate the code block itself.\nWrite flawless code with the following instructions and requirements:\n- What I want: Write a code for showing current date and time\n- Write the code in php\n- Comments preference: Give the code with comments\n- Do not give further explanation of the code you generated because it will cost me more tokens.\n- Keep the code flawless and in one go so that I don't have to make the request again to save my tokens.\n- Provide the code in the respective language code block.\n- After the main code block, suggest a filename in a JSON code block inside the 'filename' key.\n- Do proper error handling if required.\n- Adhere to all instructions and rules given to you strictly.\n- example of output format\n>>\n```{language}\ncode goes here....\n```\n\nSuggested filename is:\n```json\n{\nfilename: \"suggested file name with extension\"\n}\n```\n<<\n- keep the main code and suggest file in two completely different code blocks\n- if the asked question is irrelevant give the response as short as possible in just single paragraph withing 50 words"
      },
      {
        text: "output: ```php\n<?php\n// Get the current date and time\n$currentTime = date('Y-m-d H:i:s'); // Display the current date and time\necho \"The current date and time is: $currentTime\"; ?>\n ```\n```json\n{\"filename\": \"current_datetime.php\"}\n```"
      },
      {
        text: "input: You are a helpful code assistant that can teach a junior developer how to code. Your language of choice is python. Don't explain the code, just generate the code block itself.\nWrite flawless code with the following instructions and requirements:\n- What I want: get input search query from user and give google results page link\n- Write the code in python\n- Comments preference: Give the code without comments\n- Do not give further explanation of the code you generated because it will cost me more tokens.\n- Keep the code flawless and in one go so that I don't have to make the request again to save my tokens.\n- Provide the code in the respective language code block.\n- After the main code block, suggest a filename in a JSON code block inside the 'filename' key.\n- Do proper error handling if required.\n- Adhere to all instructions and rules given to you strictly.\n- example of output format\n>>\n```{language}\ncode goes here....\n```\n\nSuggested filename is:\n```json\n{\nfilename: \"suggested file name with extension\"\n}\n```\n<<\n- keep the main code and suggest file in two completely different code blocks\n- if the asked question is irrelevant give the response as short as possible in just single paragraph withing 50 words"
      },
      {
        text: "output: ```python\nimport webbrowser\n\nquery = input(\"Enter your search query: \")\nurl = f\"https://www.google.com/search?q={query}\"\n\nwebbrowser.open(url)\n```\n\n```json\n{\n\"filename\": \"google_search.py\"\n}\n```"
      },
      {
        text: "input: " + prompt
      },
      {
        text: "output: "
      },
    ];

    try {
      const result = await genAI.getGenerativeModel({
        model: model,
        harmCategory: HarmCategory.NONE,
        harmBlockThreshold: HarmBlockThreshold.LOW,
      }).generateContent({
        contents: [{
          role: "user", parts
        }],
        generationConfig,
      });

      const generatedCode = result.response.text();
      return generatedCode;
    } catch (error) {
      console.log('Gemini Error: ', error)
      if (error.status === 429) {
        try {
          const result = await genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            harmCategory: HarmCategory.NONE,
            harmBlockThreshold: HarmBlockThreshold.LOW,
          }).generateContent({
            contents: [{
              role: "user", parts
            }],
            generationConfig,
          });

          const generatedCode = result.response.text();
          console.log("Generated by 1.5 flash")
          return generatedCode;
        } catch (error) {
          console.log('Gemini Error: ', error)
          geminiErr = 1
          setErrorCode(true)
          return 'Error generating code: '+error.message.replace("[GoogleGenerativeAI Error]:", "")
        }
      }
      geminiErr = 1
      setErrorCode(true)
      return 'Error generating code: '+error.message.replace("[GoogleGenerativeAI Error]:", "")
    }
  };

  const generateCode = async () => {
    if (user_prompt == '') {
      setAlertMsg('Prompt is empty.')
      return
    }
    setErrorCode(false)
    let prompt = generateCodePrompt(language, user_prompt, comments_preference);
    let lowercaseLanguage = language.toLowerCase();
    let lowercaseExtensions = Object.fromEntries(Object.entries(languageExtensions).map(([key, value]) => [key.toLowerCase(), value]));
    let extension = lowercaseExtensions[lowercaseLanguage];
    setFileName(`main${extension}`);

    const codeRegEx = /```(\w+)\s([\s\S]*?)```/g;
    const fileNameRegEx = /```json([\s\S]*?)```/g;
    try {
      setGenerating(true)
      setResultsVisib(true)

      let dotCount = 0;
      let baseText = 'Generating';

      function updateLoadingText() {
        dotCount = (dotCount % 3) + 1;
        const dots = '.'.repeat(dotCount);
        setCode(`${baseText}${dots}`);
      }

      setCode('Generating');
      const interval = setInterval(updateLoadingText, 500);
      let response = await getCodeFromGemini(prompt)
      let result = response

      let matchCode = codeRegEx.exec(result)
      let rawCode;
      if (matchCode) {
        rawCode = matchCode[2]
        setSyntaxLanguage(matchCode[1])
      } else {
        if (response.includes('Internal') && response.includes('500')) {
          let response = await getCodeFromGemini(prompt)
          let result = response

          let matchCode = codeRegEx.exec(result)
          let rawCode;
          if (matchCode) {
            rawCode = matchCode[2]
            setSyntaxLanguage(matchCode[1])
          } else {
            rawCode = response
            setSyntaxLanguage('qwerty')
          }

        } else {
          rawCode = response
        }
        setSyntaxLanguage('qwerty')
      }
      setCode(rawCode.replace(/^\s*\n/gm, ''))

      let matchFileName = fileNameRegEx.exec(result)
      let fileNameJson = {};
      let file;
      if (matchFileName) {
        try {
          fileNameJson = JSON.parse(matchFileName[1]);
          if (fileNameJson.hasOwnProperty("filename")) {
            file = fileNameJson.filename;
          } else {
            let lowercaseLanguage = language.toLowerCase();
            let lowercaseExtensions = Object.fromEntries(
              Object.entries(languageExtensions).map(([key, value]) => [key.toLowerCase(), value])
            );
            let extension = lowercaseExtensions[lowercaseLanguage];
            file = `main${extension}`;
          }
        } catch (error) {
          const lowercaseLanguage = language.toLowerCase();
          const lowercaseExtensions = Object.fromEntries(
            Object.entries(languageExtensions).map(([key, value]) => [key.toLowerCase(), value])
          );
          const extension = lowercaseExtensions[lowercaseLanguage];
          file = `main${extension}`;

        }
      } else {
        const lowercaseLanguage = language.toLowerCase();
        const lowercaseExtensions = Object.fromEntries(
          Object.entries(languageExtensions).map(([key, value]) => [key.toLowerCase(), value])
        );
        const extension = lowercaseExtensions[lowercaseLanguage];
        file = `main${extension}`;

      }

      setFileName(file);

      clearInterval(interval);
      setResultsVisib(true)
      setGenerating(false)
    } catch (e) {
      console.error(e)
      setGenerating(false)
      if (geminiErr != 1) {
        setCode(e)
      }
    }


  }

  return(
    <>
    <div className='flex flex-col align-middle p-2 gap-4'>
    <h1 className="font-bold my-3 text-2xl text-green-300 text-center">AI Code Generator</h1>
    <select id="language" className="form-select block w-full px-4 py-2 mt-1 rounded-md bg-gray-800 text-white border-none focus:outline-none focus:bg-gray-800" value={language} onChange={handleLanguage}>
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
    <select className="form-select block w-full px-4 py-2 mt-1 rounded-md bg-gray-800 text-white border-none focus:outline-none focus:bg-gray-800" value={comments_preference} onChange={handleCPref}>
      <option value="without comments">Without Comments</option>
      <option value="with comments">With Comments</option>
    </select>
    <div>
      <textarea id="user_prompt" rows="5" placeholder="Describe what you want" className={`form-textarea block w-full px-4 py-2 mt-1 rounded-md bg-gray-800 text-white focus:outline-none focus:bg-gray-800 min-h-[120px] ${alertMsg != '' ? 'border-red-600 bg-red-200 ring-2 ring-red-300 placeholder:text-gray-700 focus:placeholder:text-gray-500 animate__animated animate__headShake': 'border-none'}`} value={user_prompt} onChange={handleUserPrompt}></textarea>
      <p className="text-red-600 ms-1 mt-2">
        {alertMsg}
    </p>
    </div>
    <div className="text-center">
      <button className="text-green-700 border border-green-700 w-1/2 focus:ring-4 hover:ring-4 hover:ring-green-300 focus:outline-none focus:ring-green-300 font-medium rounded-sm px-5 py-2.5 text-center mb-2 dark:border-green-400 dark:text-green-400 dark:hover:ring-green-900 dark:focus:ring-green-900" disabled={generating} onClick={generateCode}> { generating ? 'Please wait...': 'Generate Code' }</button>
    </div>
    { resultsVisib && (<div className="results">
      <Code_Block initialCode={code} fileName={filename} language={syntaxLanguage} hasError={errorCode} showFileName={true} />
      </div>
    )
      }
    </div> < />
  );
}

export default GenerateCode;