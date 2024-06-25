import React, { useState, useEffect } from "react";
import axios from "axios";
import GenerateAiImage from "./generateAiImage";
import Code_Block from "./codeBlock";
import {
  FaArrowRight,
  FaArrowDown,
  FaSpinner,
  FaRegSmileWink,
} from "react-icons/fa";
import "./image2code.css";
import TicTacToe from "./fun/tictactoe";
import Mic from "./mic";
import Footer from './Footer';
import { MdMicNone } from "react-icons/md";

const Image2Code = () => {
  const imgbb_apis = process.env.REACT_APP_IMGBB_API_KEYS.split(",");
  const imgbb_api = imgbb_apis[0].trim();
  const api_baseurl =
    window.location.hostname === "localhost"
      ? process.env.REACT_APP_API_BASEURL_LOCAL
      : process.env.REACT_APP_API_BASEURL_PRODUCTION;

  const [ipAddress, setipAddress] = useState("");
  const [alertMsg, setalertMsg] = useState("");

  const [file, setFile] = useState();
  const [imageurl, setimageurl] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [filename, setFilename] = useState("");

  const [usingFunc, setusingFunc] = useState(false);
  const [promptFunc, setpromptFunc] = useState("");

  const [cssFw, setcssFw] = useState("");

  const [usingJquery, setusingJquery] = useState(false);

  const [isProcessing, setisProcessing] = useState(false);
  const [processText, setprocessText] = useState("");
  const [processStatus, setprocessStatus] = useState(0);

  const [code, setCode] = useState("");

  const fetchIPAddress = async () => {
    try {
      const response = await axios.get("https://api.ipify.org?format=json");
      setipAddress(response.data.ip);
    } catch (error) {}
  };
  useEffect(() => {
    fetchIPAddress();
  }, []);

  const scrollDown = (px) => {
    window.scrollBy({
      top: px,
      behavior: "smooth",
    });
  };

  function prettifyHtml(htmlContent) {
    let indent = 0;
    const indentChar = "    ";
    let formattedHtml = "";
    const htmlArray = htmlContent
      .replace(/>\s*</g, "><")
      .split(/(?=<)|(?<=>)/g);

    htmlArray.forEach((element) => {
      if (element.match(/^<\/\w/)) {
        indent--;
      }
      formattedHtml += `${"  ".repeat(indent)}${element}\n`;
      if (
        element.match(/^<\w([^>]*[^\/])?>.*$/) &&
        !element.match(/<br\/?>$/)
      ) {
        indent++;
      }
    });

    return formattedHtml.trim();
  }

  const handleImageChange = async (e) => {
    let selectedFile = e.target.files[0];
    if (selectedFile) {
      setFilename(selectedFile.name);
      setFile(selectedFile);
      let reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      e.target.value = null;
    }
  };
  const handleImageClick = () => {
    document.getElementById("upload").click();
  };

  const handleFuncToggle = () => {
    usingFunc && setpromptFunc("");
    setusingFunc(!usingFunc);
  };
  const handleFuncPrompt = (e) => {
    setpromptFunc(e.target.value);
  };

  const handleCssFw = (e) => {
    setcssFw(e.target.value);
  };

  const handleUsingJquery = () => {
    setusingJquery(!usingJquery);
  };

  const uploadToCloud = async (file) => {
    try {
      let formData1 = new FormData();
      formData1 = new FormData();
      formData1.append("image", file);
      formData1.append("key", imgbb_api);
      formData1.append("key", imgbb_api);
      formData1.append("expiration", 30 * 24 * 60 * 60);

      const response = await axios.post(
        "https://api.imgbb.com/1/upload",
        formData1,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data.url;
    } catch (e) {
      console.log(e);
      throw e
    }
  };

  const saveToDb = async (imageurl, functionality, cssframework, usejquery) => {
    try {
      let save = await axios.post(
        api_baseurl + "/api/image2code",
        {
          imageurl,
          functionality,
          cssframework,
          usejquery,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return save;
    } catch (err) {
      console.log("Error saving to db: ", err);
      throw "Error saving to db: "+ err;
      return null;
    }
  };

  const getHtmlFromGemini = async (fileG) => {
    try {
      let cssPrompt, jsPrompt;
      if (cssFw != "") {
        cssPrompt =
          "** Use " +
          cssFw +
          " latest version css framework classes for maximum possible of the styling for this page instead of custom css  and include its cdn link (MUST)";
      } else {
        cssPrompt =
          "** Keep the CSS best no matter how long it goes but must be best, accurate and long enough to keep all complete styling of the image elements";
      }
      if (promptFunc != "") {
        let jsLib = usingJquery ? "jQuery" : "javascript";
        jsPrompt =
          "** Use " +
          jsLib +
          " for the following website functionality and if you don't getting the following detail for functionality then make a guess based on follwing functionality detail and add that:\n- " +
          promptFunc +
          "\n\n";
      } else {
        jsPrompt = "";
      }

      let formDataGemini = new FormData();
      formDataGemini.append("file", fileG);
      formDataGemini.append("cssPrompt", cssPrompt);
      formDataGemini.append("jsPrompt", jsPrompt);
      let geminiImage2HtmlResp = await axios.post(
        api_baseurl + "/api/gemini/image2html",
        formDataGemini,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(geminiImage2HtmlResp);
      return geminiImage2HtmlResp.data.html.replace(
        /<!DOCTYPE html(?:\[.*?\])?>/i,
        ""
      );
    } catch (e) {
      throw "Error while writing code.";
    }
  };

  async function convertHtml2Json(html) {
    let withoutDocDec = html.replace(/<!DOCTYPE html(?:\[.*?\])?>/i, "");
    try {
      let jsonFromHtml = await axios.post(api_baseurl + "/api/html2json", {
        html: withoutDocDec,
      });
      return jsonFromHtml.data.data;
    } catch (e) {
      throw "Json 2 Html Err";
    }
  }

  function findAltAttributes(json) {
    let altObjects = [];

    function recursiveFind(obj) {
      if (obj.tag === "img" && obj.attributes && obj.attributes.alt) {
        altObjects.push({ alt: obj.attributes.alt, obj });
      }
      if (obj.children) {
        for (let key in obj.children) {
          recursiveFind(obj.children[key]);
        }
      }
    }

    recursiveFind(json);
    return altObjects;
  }
  async function updateSrcAttributes(altObjects) {
    for (let { alt, obj } of altObjects) {
      try {
        const altImageUrl = await GenerateAiImage(alt);
        if (altImageUrl) {
          obj.attributes.src = await altImageUrl;
        } else {
          console.error(
            `Failed to get src for alt: "${alt}". Response data is invalid.`
          );
        }
      } catch (error) {
        console.error(`Error fetching src for alt "${alt}": ${error.message}`);
        throw `Error fetching src for alt "${alt}": ${error.message}`;
      }
    }
  }

  const convertJson2Html = (json) => {
    let html = "";

    const generateTag = (node) => {
      let tag = `<${node.tag}`;
      for (let [key, value] of Object.entries(node.attributes || {})) {
        tag += ` ${key}="${value}"`;
      }
      tag += ">";

      if (node.innerText) {
        tag += node.innerText;
      } else if (node.children) {
        for (let child of Object.values(node.children)) {
          tag += generateTag(child);
        }
      }

      tag += `</${node.tag}>`;
      return tag;
    };

    html += generateTag(json);
    return html;
  };

  const submitAction = async () => {
    setCode("")
    setprocessText("Checking image")
    setprocessStatus(13)
    if (!file) {
      setalertMsg("Select an image to unlock the magic!");
      return "Select an image to unlock the magic!";
    }
    try {
      setprocessText("Uploading image")
      setprocessStatus(21)
      let imgbbUrl = await uploadToCloud(file);
      let save = saveToDb(imgbbUrl, promptFunc, cssFw, usingJquery)
      
      let geminiForm = new FormData();
      geminiForm = new FormData();
      geminiForm.append("fileG", file);
      
      setprocessText("Analyzing image")
      setprocessStatus(39)
      let intervalP = setTimeout(function() {
        setprocessText("Writing code")
        setprocessStatus(58)
      }, 10000);
      let rawHtmlData = await getHtmlFromGemini(file)
      clearTimeout(intervalP)
      
      setprocessText("Processing")
      setprocessStatus(67)
      let jsonData = await convertHtml2Json(rawHtmlData);
      const rawJsonData = jsonData;
      setprocessText("Creating images")
      setprocessStatus(76)
      intervalP = setTimeout(function() {
        setprocessText("Enhancing images")
        setprocessStatus(93)
      }, 10000);
      const altObjects = findAltAttributes(jsonData);
      await updateSrcAttributes(altObjects);
      let finalJsonData = jsonData;
      clearTimeout(intervalP)
      setprocessText("Finalizing code")
      setprocessStatus(97)
      let finalHtmlData = await convertJson2Html(finalJsonData);
      if (!rawHtmlData) {
        throw "Error1 generating html file";
      }
      finalHtmlData = prettifyHtml(finalHtmlData);
      setCode(finalHtmlData);
      
      //RESET FORM
      scrollDown(500);
      setFile("");
      setImagePreviewUrl("");
      setFilename("");
      setusingFunc(false);
      setpromptFunc("");
      setcssFw("");
      setusingJquery(false);
                    
    } catch (e) {
      console.log(e);
      throw "Error occured :(";
    }
  };

  const handleSubmit = async () => {
    setisProcessing(true);
    setprocessText("Processing image");
    try {
      const submit = await submitAction();
      setalertMsg(submit);
    } catch (e) {
      setalertMsg("Something went wrong: "+ e);
    }
    setisProcessing(false);
  };

  return (
    <>
      <div className="relative codeDiv min-h-screen">
      <div className="absolute bg-gradient-to-r from-pink-500 to-purple-500 inset-0 blur-lg opacity-10 min-h-screen"></div>
      <div className="relative flex flex-col items-center p-2 px-4 gap-3 pb-28">
        {
          <h1 className="font-black my-4 mt-5 text-[1.75rem] text-gray-100 text-center font-mono">
            Convert Image To Code
          </h1>
        }
        {
          <div className="w-full mx-auto bg-transparent rounded-lg shadow-md overflow-hidden items-center">
            <div className="px-4 pt-6">
              <div
                id="image-preview"
                className={`max-w-sm p-6 mb-4 bg-transparent border-dashed border-2 border-gray-500 rounded-lg items-center mx-auto text-center cursor-pointer ${
                  imagePreviewUrl
                    ? ""
                    : "border-dashed border-2 border-gray-400"
                }`}
              >
                <input
                  id="upload"
                  type="file"
                  disabled={isProcessing}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  onClick={(e) => e.stopPropagation()}
                />
                <label htmlFor="upload" className="cursor-pointer">
                  {imagePreviewUrl ? (
                    <>
                      {" "}
                      <img
                        src={imagePreviewUrl}
                        className="max-h-48 rounded-lg mx-auto mb-2"
                        alt="Image preview"
                      />
                      <span
                        id="filename"
                        className="text-gray-400 text-sm z-50 px-2.5 rounded-sm"
                      >
                        {filename}
                      </span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-8 h-8 text-gray-600 mx-auto mb-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                      <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-600">
                        Upload picture
                      </h5>
                      <p className="font-normal text-sm text-gray-300 md:px-6">
                        Choose photo size should be less than{" "}
                        <b className="text-gray-600">2mb</b>
                      </p>
                      <p className="font-normal text-sm text-gray-300 md:px-6">
                        and should be in{" "}
                        <b className="text-gray-600">JPG, PNG, or GIF</b>{" "}
                        format.
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        }
        {
          <div className="w-full">
            <label
              htmlFor="#framework"
              className="ms-1 me-3 text-sm font-medium text-gray-400 cursor-pointer"
            >
              Wanted to add any CSS frameworks?
            </label>
            <select
              className="form-select block w-full px-4 py-2.5 mt-1 rounded-md bg-transparent text-white border border-gray-700 focus:outline-0 outline-0"
              disabled={isProcessing}
              id="framework"
              value={cssFw}
              onChange={handleCssFw}
            >
              <option value="">No Frameworks (Pure CSS)</option>
              <option value="Bootstrap">Bootstrap</option>
              <option value="Tailwind">Tailwind</option>
              <option value="Bulma">Bulma</option>
              <option value="Materialize CSS">Materialize CSS</option>
            </select>
          </div>
        }
        {
          <div className="w-full">
            <label className="inline-flex items-center cursor-pointer mt-1 mb-1">
              <span className="ms-1 me-3 text-sm font-medium text-white">
                Add Javascript Functionality?
              </span>
              <input
                type="checkbox"
                className="sr-only peer"
                disabled={isProcessing}
                checked={usingFunc}
                onChange={handleFuncToggle}
              />
              <div className="relative w-11 h-6 bg-transparent rounded-full border border-gray-700 peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1.5px] after:start-[1.5px] after:bg-white peer-checked:after:bg-blue-600 after:border after:border-white peer-checked:border-blue-600 peer-checked:bg-transparent after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
            {usingFunc && (
              <div className="relative">
                <Mic
                  className={`absolute bottom-1.5 right-1.5 z-10 text-center`}
                  iconClassName={`text-white text-[1.35rem]`}
                  setAlertMsg={setalertMsg}
                  setText={setpromptFunc}
                />

                <textarea
                  rows="5"
                  placeholder="Describe your script functionality"
                  className={`form-textarea block w-full px-4 pe-11 py-2 mt-3 mb-2 rounded-md bg-transparent text-white focus:outline-0 outline-0 min-h-[120px] border border-gray-700`}
                  value={promptFunc}
                  onChange={handleFuncPrompt}
                ></textarea>
              </div>
            )}
          </div>
        }
        {
          <div className="w-full text-left">
            <label className="inline-flex items-center cursor-pointer mt-1 mb-1">
              <span className="ms-1 me-3 text-sm font-medium text-white">
                Use jQuery?
              </span>
              <input
                type="checkbox"
                id="useJquery"
                checked={usingJquery}
                disabled={isProcessing}
                onChange={handleUsingJquery}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-transparent rounded-full border border-gray-700 peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1.5px] after:start-[1.5px] after:bg-white peer-checked:after:bg-blue-600 after:border after:border-white peer-checked:border-blue-600 peer-checked:bg-transparent after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        }
        {
          <div className="w-full text-center">
            {alertMsg && (
              <p className="text-center text text-red-600">{alertMsg}</p>
            )}
            <button
              className="mt-5 border max-h-full focus:ring-4 w-2/5 hover:ring-4 focus:outline-none font-medium rounded-md px-3 py-2.5 text-center mb-2 border-blue-400 text-blue-400 hover:ring-blue-900 focus:ring-blue-800 disabled:ring-0"
              disabled={isProcessing}
              onClick={handleSubmit}
            >
              {isProcessing ? "Hold on..." : "Start Magic"}
            </button>
          </div>
        }
        {code && (
          <>
          <h3 className='text-center font-bold text-xl text-green-400'>Task done boss!</h3>
          <div className="results w-full flex flex-col items-center">
            <Code_Block
              initialCode={code}
              fileName="Generated Code"
              language="html"
              hasError={false}
              showFileName={true}
            />
          </div>
          </>
        )}
        {isProcessing && (
          <>
            {" "}
            <div className="fixed min-h-screen min-w-full bg-black opacity-90 top-0 z-30 text-center text-white touch-none"></div>
            <div className="fixed translate-x-[-50%] left-[50%] top-5 z-30">
              <p className="text-white text-sm font-medium text-center whitespace-nowrap overflow-x-hidden mt-2">
                Please wait, it may take some time...
              </p>
            </div>
            <div className="fixed text-white -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 z-30 w-full px-3">
              <div className="flex flex-col justify-center items-center gap-1.5 text-center min-w-full">
                <div className="mb-1 h-4 overflow-hidden rounded-full min-w-full bg-gray-200">
                  <div
                    className="h-4 animate-pulse rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-sm flex justify-center items-center transition transition-all duration-1000"
                    style={{ width: processStatus + "%" }}
                  >
                    {" "}
                    <span>{processStatus}%</span>
                  </div>
                </div>
                <span>{processText}</span>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
      </div>
    </>
  );
};

export default Image2Code;
