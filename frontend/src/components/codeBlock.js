import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { CodeBlock, CopyBlock, tomorrowNightBright } from 'react-code-blocks';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';
import { FiCopy, FiEdit, FiEye } from 'react-icons/fi';
import './codeBlock.css';

const Code_Block = ({ initialCode , fileName = '' , language = 'javascript', hasError=false, showFileName=true }) => {
  const [isEditable, setIsEditable] = useState(false);
  const [code, setCode] = useState(initialCode);
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);
  language = language.toLowerCase();
  const languageToUse = languages[language] ? language : 'javascript';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="container p-3 rounded bg-dark text-light">
      <div className="d-flex relative justify-content-between mb-2">
        {showFileName && (
            <h3 className="text-gray-100 relative px-4 bg-gray-600 text-sm py-0.5 rounded inline-block">
                {fileName}
            </h3>
          )}
        <div className={`flex justify-end gap-3 inline-block ${showFileName ? 'absolute top-2 right-1' : 'sticky me-1'}`}>
          <button className="btn btn-primary text-gray-100" onClick={handleCopy}>
            <FiCopy />
          </button>
          <button className="btn btn-success text-gray-100" onClick={() => setIsEditable(!isEditable)}>
            {isEditable ? <FiEye /> : <FiEdit />}
          </button>
        </div>
      </div>
      {isEditable ? (
        <Editor
          value={code}
          onValueChange={(code) => setCode(code)}
          highlight={(code) => highlight(code, languages[languageToUse], {language: languageToUse})}
          padding={10}
          className="editor rounded border-none outline-none w-full h-full"
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