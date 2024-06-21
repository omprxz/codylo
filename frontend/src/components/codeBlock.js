import { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { CodeBlock, CopyBlock, tomorrowNightBright } from 'react-code-blocks';
import fileDownload from 'react-file-download';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup-templating';
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-php";
import "prismjs/components/prism-go";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-css";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-django";
import "prismjs/components/prism-r";
import "prismjs/components/prism-julia";
import "prismjs/components/prism-scala";
import "prismjs/components/prism-matlab";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-lua";
import "prismjs/components/prism-solidity";
import 'prismjs/themes/prism-tomorrow.css';

import { FiCopy, FiEdit, FiEye, FiDownload } from 'react-icons/fi';
import './codeBlock.css';


const Code_Block = ({ initialCode, fileName = 'Modified Code', language = 'javascript', hasError = false, showFileName = true }) => {
  const languageExtensions = {
    "JavaScript": ".js",
    "Python": ".py",
    "Java": ".java",
    "C": ".c",
    "C++": ".cpp",
    "C#": ".cs",
    "Ruby": ".rb",
    "PHP": ".php",
    "Plaintext": ".txt",
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
  const [isEditable, setIsEditable] = useState(false);
  const [code, setCode] = useState(initialCode);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

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

  const languageToUse = Prism.languages[languageMap[language] || language] ? languageMap[language] || language : 'clike';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };
  
  const handleDownload = () => {
    if(fileName.includes('.')){
      fileDownload(code, fileName);
    }else{
      let ext='';
      try{
        ext = Object.entries(languageExtensions).find(([key, value]) => key.toLowerCase() === language.toLowerCase())[1];
        console.log(language)
      }catch(e){
        ext = '.txt'
      }
      fileDownload(code, 'codylo code'+ext);
    }
  
};

  return (
    <div className="container p-3 rounded bg-dark text-light">
      <div className="relative flex justify-between items-center py-2 bg-gray-800 rounded-t-lg px-3">
        <h3 className="relative text-white text-sm inline-block whitespace-nowrap w-[52%] fileName">
            <p className='w-full overflow-x-scroll overflow-y-hidden'>{fileName}</p>
        </h3>
        <div className='flex justify-between gap-3.5 items-center inline-block'>
          <button className="text-white text-sm" onClick={handleCopy}>
            <FiCopy className='inline-block mr-[1px]' /> Copy
          </button>
          <button className="text-white text-sm" onClick={() => setIsEditable(!isEditable)}>
            {isEditable ? <> <FiEye className='inline-block mr-[1px]' /> View </> : <> <FiEdit className='inline-block mr-[1px]' /> Edit</>}
          </button>
          <button className="text-white text-sm" onClick={handleDownload}>
            <FiDownload className='inline-block mr-[1px]' />
          </button>
        </div>
      </div>
      {isEditable ? (
        <Editor
          value={code}
          onValueChange={(code) => setCode(code)}
          highlight={(code) => Prism.highlight(code, Prism.languages[languageToUse], languageToUse)}
          padding={10}
          className="editor rounded-b-lg border-none outline-none w-full h-full"
          style={{
            backgroundColor: tomorrowNightBright.backgroundColor,
            color: '#f8f8f2',
            fontFamily: '"Fira Code", "Fira Mono", monospace',
            fontSize: '14px',
            lineHeight: '1.5em',
          }}
        />
      ) : (
        <div className={`CodeBlockDiv w-full ${hasError ? 'error' : ''}`}>
          <CodeBlock
            text={code}
            language={language}
            showLineNumbers={false}
            theme={tomorrowNightBright}
          />
        </div>
      )}
    </div>
  );
};

export default Code_Block;