import React, { useState, useEffect } from "react";
import axios from "axios";
import ImageBgDetect from "./ImageBgDetect";
import GenerateAiImage from "./generateAiImage";
import Code_Block from "./codeBlock";
import {
    FaArrowRight,
    FaArrowDown,
    FaSpinner,
    FaRegSmileWink
} from "react-icons/fa";
import "./image2code.css";
import OptimizeHtml from "./i2cOptimizeRawHtml";
import TicTacToe from "./fun/tictactoe";
import Mic from "./mic";
import { MdMicNone } from 'react-icons/md';

const Image2Code = () => {
    const imgbb_apis = process.env.REACT_APP_IMGBB_API_KEYS.split(",");
    const imgbb_api = imgbb_apis[0].trim();
    const api_baseurl =
        window.location.hostname === "localhost"
            ? process.env.REACT_APP_API_BASEURL_LOCAL
            : process.env.REACT_APP_API_BASEURL_PRODUCTION;

    const [ipAddress, setipAddress] = useState("");
    const [alertMsg, setalertMsg] = useState("");

    const [file, setFile] = useState("");
    const [mimeType, setmimeType] = useState("");
    const [imageurl, setimageurl] = useState("");
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");
    const [filename, setFilename] = useState("");
    const [width, setwidth] = useState(null);
    const [height, setheight] = useState(null);
    const [bgColor, setbgColor] = useState("#FFFFFF");

    const [usingFunc, setusingFunc] = useState(false);
    const [promptFunc, setpromptFunc] = useState("");

    const [cssFw, setcssFw] = useState("");

    const [usingJquery, setusingJquery] = useState(false);

    const [isProcessing, setisProcessing] = useState(false);
    const [processText, setprocessText] = useState("");
    const [processStatus, setprocessStatus] = useState(0);

    const [code, setCode] = useState("");

    let promptGeminiImage;

    const fetchIPAddress = async () => {
        try {
            const response = await axios.get(
                "https://api.ipify.org?format=json"
            );
            setipAddress(response.data.ip);
        } catch (error) {}
    };
    useEffect(() => {
        fetchIPAddress();
    }, []);

    const scrollDown = (px) => {
        window.scrollBy({
            top: px,
            behavior: "smooth"
        });
    };

    const handleImageChange = async (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            setFilename(selectedFile.name);
            setFile(selectedFile);
            setmimeType(selectedFile.type);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(selectedFile);
            await getDimensions(selectedFile);
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
            formData1.append("expiration", 30 * 24 * 60 * 60);

            const response = await axios.post(
                "https://api.imgbb.com/1/upload",
                formData1,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
            return response.data.data.url;
        } catch (e) {
            console.log(e);
            throw e;
            return;
        }
    };

    const getDimensions = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const image = new Image();
            image.onload = () => {
                const dimensions = {
                    width: image.width,
                    height: image.height
                };
                setwidth(dimensions.width);
                setheight(dimensions.height);
            };
            image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    const getJsonFromGemini = async (fileG, widthG, heightG, bgcolorG) => {
        try {
            const formDataGemini = new FormData();
            formDataGemini.append("file", fileG);
            formDataGemini.append("width", widthG);
            formDataGemini.append("height", heightG);
            formDataGemini.append("bgcolor", bgcolorG);
            formDataGemini.append("cssFw", cssFw);
            formDataGemini.append("usingJquery", usingJquery);
            formDataGemini.append("promptFunc", promptFunc);
            let geminiImage2JsonResp = await axios.post(
                api_baseurl + "/api/gemini/image2json",
                formDataGemini,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
            promptGeminiImage = geminiImage2JsonResp.data.promptImage;
            return geminiImage2JsonResp.data.data.response.candidates[0].content
                .parts[0].text;
        } catch (e) {
            console.error("Json fetching error: ", e);
            return null;
        }
    };

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
                console.error(
                    `Error fetching src for alt "${alt}": ${error.message}`
                );
            }
        }
    }

    const generateHtml = (json) => {
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

        html += generateTag(json.html);
        return html;
    };

    const submitAction = async () => {
        if (!file) {
            setalertMsg("Select an image to unlock the magic!");
            return "Select an image to unlock the magic!";
        }
        try {
            setprocessText("Getting image dimensions");
            setprocessStatus(4);

            setprocessText("Uploading image");
            setprocessStatus(16);
            let imgcloudUrl = await uploadToCloud(file);
            setimageurl(imgcloudUrl);

            setprocessText("Detecting background");
            setprocessStatus(25);
            let maxColor = await ImageBgDetect(imgcloudUrl);
            setbgColor(maxColor.hex);

            let postData = {
                imageurl: imgcloudUrl,
                functionality: promptFunc,
                cssframework: cssFw,
                usejquery: usingJquery,
                bgcolor: maxColor.hex,
                ip: ipAddress
            };

            try {
                setprocessText("Saving details");
                setprocessStatus(30);
                try {
                    const postDetails = axios.post(
                        api_baseurl + "/api/image2code",
                        postData,
                        {
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }
                    );
                } catch (e) {}
                try {
                    let interval;
                    setprocessText("Analyzing image");
                    interval = setTimeout(function () {
                        setprocessText("Image analyzing almost done");
                        setprocessStatus(55);
                    }, 10000);
                    setprocessStatus(70);

                    let geminiImage2JsonData = await getJsonFromGemini(
                        file,
                        width,
                        height,
                        maxColor.hex
                    );
                    if (!geminiImage2JsonData) {
                        geminiImage2JsonData = await getJsonFromGemini(
                            file,
                            width,
                            height,
                            maxColor.hex
                        );
                    }
                    clearInterval(interval);
                    let jsonData;
                    let jsonRegex = /```json\s([\s\S]*?)```/g;
                    try {
                        jsonData = JSON.parse(geminiImage2JsonData);
                    } catch (e) {
                        jsonData = null;
                    }

                    if (!jsonData) {
                        let matchedJson = jsonRegex.exec(geminiImage2JsonData);
                        if (matchedJson) {
                            try {
                                jsonData = JSON.parse(matchedJson[1]);
                            } catch (e) {
                                jsonData = null;
                            }

                            if (!jsonData) {
                                geminiImage2JsonData = await getJsonFromGemini(
                                    file,
                                    width,
                                    height,
                                    maxColor.hex
                                );
                                if (!geminiImage2JsonData) {
                                    geminiImage2JsonData =
                                        await getJsonFromGemini(
                                            file,
                                            width,
                                            height,
                                            maxColor.hex
                                        );
                                }

                                try {
                                    jsonData = JSON.parse(geminiImage2JsonData);
                                } catch (e) {
                                    jsonData = null;
                                }

                                if (!jsonData) {
                                    let matchedJson =
                                        jsonRegex.exec(geminiImage2JsonData);
                                    if (matchedJson) {
                                        try {
                                            jsonData = JSON.parse(
                                                matchedJson[1]
                                            );
                                        } catch (e) {
                                            jsonData = null;
                                            return "Something went wrong";
                                        }
                                    } else {
                                        console.error(
                                            "Json fetching error multiple times"
                                        );
                                        return;
                                    }
                                }
                            }
                        }
                    }

                    const rawJsonData = JSON.parse(JSON.stringify(jsonData));
                    setprocessText("Generating internal images");
                    setprocessStatus(80);
                    interval = setTimeout(function () {
                        setprocessText("Image generating almost done");
                        setprocessStatus(85);
                    }, 8000);
                    const altObjects = findAltAttributes(jsonData.html);

                    await updateSrcAttributes(altObjects);
                    clearInterval(interval);
                    const finalJsonData = JSON.parse(JSON.stringify(jsonData));

                    setprocessText("Generating code");
                    setprocessStatus(90);
                    const rawHtmlData = await generateHtml(finalJsonData);

                    if (!rawHtmlData) {
                        throw "Error1 generating html file";
                    }

                    let finalHtmlData;
                    try {
                        if (cssFw != "" || promptFunc != "") {
            let customInst = "";
              customInst += "\nImagine you're a seasoned pro in HTML, CSS, and JavaScript, including various CSS frameworks.\nPlease must follow these extra custom instructions while generating the final HTML output code:\n-Final output html code must have to in html code block like in this structure:\n\`\`\`html\nHtml output code goes here...\n\`\`\`\nMust follow this output structure (don't give output html code without code block.\n-What is the fullform of HTML";

            customInst += cssFw ? `\n- Include and use ${cssFw} framework for styling.\n- Use CSS styling only if specific styling is not achievable with this framework.`  : "";

      let useJqueryPrompt = usingJquery ? "NOTE: Use jQuery instead of pure JavaScript and include jQuery CDN link too." : "";

       customInst += promptFunc ? `\n- Add JavaScript functionality in this output HTML code and embed the script code within the single HTML file.\nHere's the functionality instructions:\n${promptFunc}\n${useJqueryPrompt}\nStart now` : "";
           setprocessText("Adding frameworks and libraries");
             setprocessStatus(95);
          let finalHtmlResp = await OptimizeHtml(rawHtmlData, customInst );
 let htmlRegex = /```html\s([\s\S]*?)```/g;
                            let matchedHtml = htmlRegex.exec(finalHtmlResp);

                            if (matchedHtml) {
                       finalHtmlData = matchedHtml[1];
                            } else {
                  finalHtmlData = rawHtmlData;
                            }
                        } else {
                            finalHtmlData = rawHtmlData;
                        }
                    } catch (e) {
                        finalHtmlData = rawHtmlData;
                    }
                    setCode(finalHtmlData);
                    //Reset form
                    setFile("");
                    setImagePreviewUrl("");
                    setFilename("");
                    setmimeType("");
                    setusingFunc(false);
                    setpromptFunc("");
                    setcssFw("");
                    setusingJquery(false);
                    scrollDown(500);
                } catch (error) {
                    throw new Error(
                        "Error sending image and fetching image details:" +
                            error
                    );
                }
            } catch (error) {
                throw new Error("Something went wrong");
            }
        } catch (e) {
            console.log(e);
            return "Something went wrong";
        }
    };

    const handleSubmit = async () => {
        setisProcessing(true);
        setprocessText("Processing image");
        try {
            const submit = await submitAction();
            setalertMsg(submit);
        } catch (e) {
            setalertMsg("Something went wrong: ", e);
            setFile("");
            setFilename("");
            setImagePreviewUrl("");
            setmimeType("");
        }
        setisProcessing(false);
        setprocessText("");
    };

    return (
        <>
            <div className="flex flex-col items-center p-2 px-3 gap-3 pb-20">
                {
                    <h1 className="font-bold my-3 text-2xl text-green-300 text-center">
                        AI Image To Code
                    </h1>
                }
                {
                    <div className="w-full mx-auto bg-gray-800 rounded-lg shadow-md overflow-hidden items-center">
                        <div className="px-4 py-6">
                            <div
                                id="image-preview"
                                className={`max-w-sm p-6 mb-4 bg-gray-900 border-dashed border-2 border-gray-500 rounded-lg items-center mx-auto text-center cursor-pointer ${
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
                                <label
                                    htmlFor="upload"
                                    className="cursor-pointer"
                                >
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
                                                Choose photo size should be less
                                                than{" "}
                                                <b className="text-gray-600">
                                                    2mb
                                                </b>
                                            </p>
                                            <p className="font-normal text-sm text-gray-300 md:px-6">
                                                and should be in{" "}
                                                <b className="text-gray-600">
                                                    JPG, PNG, or GIF
                                                </b>{" "}
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
                            <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-900 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-gray-600 peer-checked:bg-green-500"></div>
                        </label>
                        {usingFunc && (
                            <div className="relative">
                                <Mic
                                    className={`absolute bottom-1.5 right-1.5 z-10 mic-container text-center`}
                                    iconClassName={`text-white text-[1.35rem]`}
                                    setAlertMsg={setalertMsg}
                                    setText={setpromptFunc}
                                />

                                <textarea
                                    rows="5"
                                    placeholder="Describe your script functionality"
                                    className={`form-textarea block w-full px-4 pe-10 py-2 mt-2 rounded-md bg-gray-800 text-white focus:outline-none focus:bg-gray-800 min-h-[120px] border-none`}
                                    value={promptFunc}
                                    onChange={handleFuncPrompt}
                                ></textarea>
                            </div>
                        )}
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
                            className="form-select block w-full px-4 py-2 mt-1 rounded-md bg-gray-800 text-white border-none focus:outline-none focus:bg-gray-800"
                            disabled={isProcessing}
                            id="framework"
                            value={cssFw}
                            onChange={handleCssFw}
                        >
                            <option value="">No Frameworks (Pure CSS)</option>
                            <option value="Bootstrap">Bootstrap</option>
                            <option value="Tailwind">Tailwind</option>
                            <option value="Bulma">Bulma</option>
                            <option value="Materialize CSS">
                                Materialize CSS
                            </option>
                        </select>
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
                            <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-900 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-gray-600 peer-checked:bg-green-500"></div>
                        </label>
                    </div>
                }
                {
                    <div className="w-full text-center">
                        {alertMsg && (
                            <p class="text-center text text-red-600">
                                {alertMsg}
                            </p>
                        )}
                        <button
                            className="mt-4 border max-h-full focus:ring-4 hover:ring-4 focus:outline-none font-medium rounded-sm px-5 py-2.5 text-center mb-2 border-green-400 text-green-400 hover:ring-green-900 focus:ring-green-900 disabled:ring-0"
                            disabled={isProcessing}
                            onClick={handleSubmit}
                        >
                            {isProcessing ? "Hold on..." : "Start Magic"}
                        </button>
                    </div>
                }
                {code && (
                    <div className="results w-full flex flex-col items-center">
                        <Code_Block
                            initialCode={code}
                            fileName="Generated Code"
                            language="html"
                            hasError={false}
                            showFileName={true}
                        />
                    </div>
                )}
                {isProcessing && (
                    <>
                        {" "}
                        <div className="fixed min-h-screen min-w-full bg-black opacity-90 top-0 z-30 text-center text-white touch-none"></div>
                        <div className="fixed translate-x-[-50%] left-[50%] top-5 z-30">
                            <TicTacToe />
                            <p className="text-white text-sm font-medium text-center whitespace-nowrap overflow-x-hidden mt-2">
                                It may take some time, till then enjoy playing
                                Tic-Tac-Toe{" "}
                                <FaRegSmileWink className="inline-block mx-1" />
                            </p>
                        </div>
                        <div className="fixed text-white translate-x-[-50%] bottom-5 left-[50%] z-30 w-full px-3">
                            <div className="flex flex-col justify-center items-center gap-1.5 text-center min-w-full">
                                <div className="mb-5 h-4 overflow-hidden rounded-full min-w-full bg-gray-200">
                                    <div
                                        className="h-4 animate-pulse rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-sm flex justify-center items-center transition transition-all duration-500"
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
        </>
    );
};

export default Image2Code;
