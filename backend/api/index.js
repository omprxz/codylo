const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");
const { JSDOM } = require('jsdom');
const mime = require("mimetype");
const Replicate = require("replicate");
require("dotenv").config();
const bodyParser = require("body-parser");
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/files");

const Feedback = require("../db/Feedback");
const Image2CodeModel = require("../db/Image2Code");

const port = process.env.PORT || 3300;
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json());
const corsOptions = {
    origin: ["http://localhost:3000", "https://codylo.vercel.app"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const NODE_ENV = process.env.NODE_ENV;
let MONGO_URI;
if(NODE_ENV == 'production'){
  MONGO_URI = process.env.MONGODB_URI
}else{
  MONGO_URI = process.env.MONGO_URI_LOCAL
}

async function connectToDatabase() {
    try {
        await mongoose.connect(MONGO_URI, {
        });
        console.log('Connected to the database');
    } catch (error) {
        console.error('Error connecting to the database', error);
    }
}

connectToDatabase();

const geminiApiKeys = process.env.GEMINI_API_KEYS.split(',');
const geminiApiKey = geminiApiKeys[2].trim()
const geminiApiIndex = [2, geminiApiKeys.length]

const replicateApiKeys = process.env.REPLICATE_API_TOKENS.split(',')
const replicateApiKey = replicateApiKeys[0].trim()

let rootDir = "/tmp/";
if(process.env.NODE_ENV != 'production'){
  rootDir = './'
}

const uploadDirOriginalImages = "uploads/image2code/original_images/";
const absoluteUploadDir = path.join(rootDir, uploadDirOriginalImages);
if (!fs.existsSync(absoluteUploadDir)) {
    fs.mkdirSync(absoluteUploadDir, { recursive: true });
}

const uploadGemini = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, rootDir + "uploads/image2code/original_images/");
        },
        filename: function (req, file, cb) {
            const extension = path.extname(file.originalname);
            cb(
                null,
                file.fieldname +
                    "-" +
                    Date.now() +
                    path.extname(file.originalname)
            );
        }
    })
});

const saveFeedback = async (name, email, feedback) => {
    try {
        const newFeedback = await Feedback.create({ name, email, feedback });
        return newFeedback;
    } catch (err) {
        console.error("Error saving feedback:", err);
        throw err;
    }
};

async function sendEmail(name, email, text, recipientEmail, from, passPath) {
    const password = process.env[passPath];

    let subject = `New suggestion from Codylo user - ${name}`;
    let content = `Message: ${text}\n\nName: ${name}\nEmail: ${email}\n`;

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: from,
            pass: password,
        },
    });

    const message = {
        from: from,
        to: recipientEmail,
        subject: subject,
        text: content,
    };

    try {
        const info = await transporter.sendMail(message);
        let newFb;
        try{
         newFb = await saveFeedback(name, email, text);
        }catch(e){
          newFb = 'Not save to database.'
        }
        return { message: "Email sent!", status: "success", data: newFb };
    } catch (err) {
        console.error("Error sending email or saving feedback:", err);
        throw err;
    }
}

// APIS >>
app.post("/api/sendFeedbackMail", async (req, res) => {
    const { name, email, text } = req.body;

    try {
        const result = await sendEmail(
            name,
            email,
            text,
            "omprxz@gmail.com",
            "ompkr69@gmail.com",
            "GMAIL_APP_PASSWORD_FB"
        );
        res.json(result); 
    } catch (err) {
        console.error("Failed to send email or save feedback:", err);
        res.status(500).json({ error: "Failed to send email or save feedback" });
    }
});

app.post("/api/image2code", async (req, res) => {
    const { imageurl, functionality, cssframework, usejquery, ip } =
        req.body;

    if (imageurl == "") {
        res.json({
            message: "Image not uploaded properly",
            status: "error"
        });
    }

    const saveToDb = await Image2CodeModel.create({
        imageurl,
        functionality,
        cssframework,
        usejquery,
        ip
    });
    res.status(200).json({
        message: "Details saved to database.",
        status: "success",
        data: saveToDb
    });
});

app.post(
    "/api/gemini/image2html",
    uploadGemini.single("file"),
    async (req, res) => {
        const { file } = req;
        const uploadedFileName = file.filename;
        if (!file) {
            res.status(400).json({ message: "No file uploaded" });
        }
        
        function getRandomIntegerExcluding(min, max, exclude) {
    let randomNumber;
    do {
        randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (randomNumber === exclude);

    return randomNumber;
}
        
        async function generateCode(geminiApi, uploadedFilePath, geminiModel = "gemini-1.5-pro"){
          const genAI = new GoogleGenerativeAI(geminiApi);
          const fileManager = new GoogleAIFileManager(geminiApi);
          
        async function uploadToGemini(filePath, mimeType) {
                const uploadResult = await fileManager.uploadFile(filePath, {
                    mimeType,
                    displayName: path.basename(filePath)
                });
                const file = uploadResult.file;
                return file;
            }
          const files = [ await uploadToGemini(uploadedFilePath, mime.lookup(uploadedFilePath)) ];
          const generationConfig = {
                    temperature: req.body.temperature || 1,
                    topP: req.body.topP || 0.95,
                    topK: req.body.topK || 64,
                    maxOutputTokens: req.body.maxOutputTokens || 15000,
                    responseMimeType: "text/plain"
                };
                
          const model = genAI.getGenerativeModel({
  model: geminiModel,
  systemInstruction: "Generate an image that replicates the given source image with precise details. The final rendered preview must match the original image exactly.\n\nRequirements & Instructions:\n\n** Background Styles:\n"+ req.body.cssPrompt +"\n\n   - Replicate the body background styling and designs, using CSS only for its design and pattern if available, without using background images.\n - Avoid using background-image css property for images instead use html 'img' tag\n\n** Text and Fonts:\n   - Detect and apply the correct font family, size, color, weight, and style.\n   - Replicate text alignments, line heights, letter spacing, and any text decorations as seen in the image.\n\n** Icons and Images:\n   - Extract and place all icons and images accurately.\n   - Ensure icons are styled using FontAwesome 5 classes (<i> tags) and include the FontAwesome CDN link.\n\n** Layout Structure:\n   - Recreate the layout using appropriate HTML tags (divs, sections, headers, footers, etc.).\n   - Maintain correct spacing, margins, and paddings to match the original design.\n\n** Interactive Elements:\n   - Style buttons and interactive elements with accurate hover and active states.\n   - Must detect borders, shadows, and other styles of elements and texts and replicate corresponding css styling finely.\n\n** Advanced Styling:\n   - Mimic additional styling such as box shadows, border-radius, opacity, and transformations.\n   - Utilize CSS properties like flexbox or grid for layout as needed.\n\n** Responsiveness:\n   - Implement responsive designs to accommodate various screen sizes, if indicated by the image.\n\n** Color Detection and Application:\n   - Detect and apply all colors accurately (background, font, border, etc.) using the respective element's style attribute.\n\n** Unique IDs for Selectors:\n   - Assign unique but relatable \"id\" attributes to each tag and element (excluding <html>, <head>, and children) to facilitate CSS selectors.\n\n** Audio Tags:\n    - Set the \"src\" attribute value of recognized <audio> tags to \"1.mp3\".\n\n** Iframe Elements:\n    - Analyze and hypothesize related content for recognized <iframe> elements.\n    - Attach a relevant internet link to the \"src\" attribute.\n\n** Title Tag:\n    - Suggest an appropriate title for the page based on the image content and store it in the innerText of the <title> tag.\n\n** Image Descriptions:\n    - Describe images inside the given image in very detail, including image style, theme, context, and each element and background and assign it to corresponding \"alt\" attribute. But keep it inside 300 characters\n\n** Detect and recognize various colors in image and use them properly\n\n** Detect and recognize various font styles, font weight and font families and use them properly on that corresponding text\n\n** Detect and keep the alignments and position of elements properly\n\n\n** Output Format:\n    - Provide the output in a code block of HTML with embedded CSS.\n\n** Viewport width:\n    - Must add meta tag for viewport with width to device width and initial scale to 1.\n\n** Remove document type declaration:\n    - Don't include any kind of html document type declaration like '<!DOCTYPE html>'\n\n** No extra explanation:\n    - Don't give me any explanation my instructions.\n\n"+ req.body.jsPrompt +"Output Format:\n\n\\`\\`\\`html\n<html>\n <!-- IMAGE REPLICATED CODE GOES HERE... -->\n</html>\n\\`\\`\\` \n\n If anyone asks about you, don't disclose your identity that you are trained by google. Reply them that you are trained and built by Om.",
});
          const chatSession = model.startChat({
    generationConfig,
    safetySettings: [
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_NONE"
                        }
                    ],
    history: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: files[0].mimeType,
              fileUri: files[0].uri,
            },
          },
        ],
      },
    ],
  });
          try{
            let htmlCode;
          let result = await chatSession.sendMessage("Heres the image:");
          let resultText = result.response.text()
          let htmlRegex = /\`\`\`html\s([\s\S]*?)\`\`\`/g
          let matchedHtml = htmlRegex.exec(resultText)
          if(matchedHtml){
            htmlCode = matchedHtml[1].replace(/<!DOCTYPE html(?:\[.*?\])?>/i, '')
          }else{
            generateCode(geminiApiKeys[getRandomIntegerExcluding(0, geminiApiIndex[1], geminiApiIndex[0])].trim(), uploadedFilePath, "gemini-1.5-pro")
          }
          
          return htmlCode;
          }catch(e){
            if(e.status == 429){
              generateCode(geminiApiKeys[getRandomIntegerExcluding(0, geminiApiIndex[1], geminiApiIndex[0])].trim(), uploadedFilePath, "gemini-1.5-pro")
            }else{
              console.log("AI Model Error: ",e)
              throw new Error("AI Model Error: "+e)
            }
          }
        }
        
        try {
              const uploadedFilePath = path.join(rootDir + "uploads/image2code/original_images/",
                uploadedFileName);
              const generatedHtml = await generateCode(geminiApiKeys[geminiApiIndex[0]].trim(), uploadedFilePath, "gemini-1.5-pro")
                res.json({
                    message: "HTML Generated",
                    status: "success",
                    html: generatedHtml,
                });
        } catch (error) {
                console.log(error)
                res.json({
                  status: "error",
                  message: "Error writing code"
                });
            }
    }
);

app.post('/api/html2json', (req, res)=> {
  const { html } = req.body
  try{
  const generateJson = (element) => {
    const obj = {
        tag: element.tagName.toLowerCase(),
        attributes: {}
    };

    for (let attr of element.attributes) {
        obj.attributes[attr.name] = attr.value;
    }

    if (element.childNodes.length === 0) {
        if (element.innerText) {
            obj.innerText = element.innerText.trim();
        }
    } else {
        obj.children = {};
        let childIndex = 1;
        for (let child of element.childNodes) {
            if (child.nodeType === 1) { // Element node
                obj.children[`${child.tagName.toLowerCase()}${childIndex}`] = generateJson(child);
                childIndex++;
            } else if (child.nodeType === 3 && child.nodeValue.trim()) { // Text node
                obj.innerText = child.nodeValue.trim();
            }
        }
    }

    return obj;
};
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const jsonContent = generateJson(document.documentElement);
  res.json({status: "success", data: jsonContent})
  }catch(e){
    res.json({status:'error', message: 'Error converting HTML 2 JSON'})
  }
})

app.post("/api/text2image/replicate", async (req, res) => {
    try {
      
const replicate = new Replicate({
    auth: replicateApiKey
});
        const { prompt } = req.body;

        const input = {
            cfg: 10,
            prompt: prompt,
            aspect_ratio: "3:2",
            output_format: "png",
            output_quality: 80,
            negative_prompt: "ugly, distorted"
        };
        const output = await replicate.run("stability-ai/stable-diffusion-3", {
            input
        });
        res.json({
            status: "success",
            imageUrl: output[0]
        });
    } catch (e) {
        res.json({
            data: "error",
            message: "Error while generating through replicate" + e
        });
    }
});
// << APIS
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
