const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");
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

let MONGO_URI;
if(process.env.NODE_ENV == 'production'){
  MONGO_URI = process.env.MONGO_URI
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
const replicateApiKeys = process.env.REPLICATE_API_TOKENS.split(',')
const replicateApiKey = replicateApiKeys[0].trim()

const uploadDirOriginalImages = "uploads/image2code/original_images/";
const absoluteUploadDir = path.join("/tmp", uploadDirOriginalImages);
if (!fs.existsSync(absoluteUploadDir)) {
    fs.mkdirSync(absoluteUploadDir, { recursive: true });
}

const uploadGemini = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "/tmp/uploads/image2code/original_images/");
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
        console.log(newFeedback);
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

app.get("/api/proxy-image", async (req, res) => {
    try {
        const imageUrl = req.query.url;
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer"
        });
        const imageBuffer = Buffer.from(response.data, "binary");
        res.writeHead(200, {
            "Content-Type": response.headers["content-type"]
        });
        res.end(imageBuffer);
    } catch (error) {
        console.error("Error fetching image:", error.message);
        res.status(500).send("Error fetching image: " + error.message);
    }
});

app.post("/api/image2code", async (req, res) => {
    const { imageurl, functionality, cssframework, bgcolor, usejquery, ip } =
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
        bgcolor,
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
    "/api/gemini/image2json",
    uploadGemini.single("file"),
    async (req, res) => {
        const { file } = req;
        let promptImgs = ["https://i.ibb.co/NNtCLpR/1.png", "https://i.ibb.co/3ShnnNB/2.png"]
        const uploadedFileName = file.filename;
        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        try {

            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const fileManager = new GoogleAIFileManager(geminiApiKey);

            async function uploadToGemini(filePath, mimeType) {
                const uploadResult = await fileManager.uploadFile(filePath, {
                    mimeType,
                    displayName: path.basename(filePath)
                });
                const file = uploadResult.file;
                console.log(
                    `Uploaded file ${file.displayName} as: ${file.name}`
                );
                return file;
            }
            
            async function getFileFromUrl(img, filename) {
    const dirPath = '/tmp/uploads/image2code/prompt_images/';
    const filePath = path.join(dirPath, filename);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const writer = fs.createWriteStream(filePath);

    const response = await axios({
        url: img,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}
            try{
            await getFileFromUrl(promptImgs[0], "1.png")
            await getFileFromUrl(promptImgs[1], "2.png")
            } catch(e){
              console.log(e)
            }

            const uploadedFilePath = path.join("/tmp/uploads/image2code/original_images/",
                uploadedFileName
            );

            const contentGeminiImage = await uploadToGemini(
                uploadedFilePath,
                mime.lookup(uploadedFilePath)
            );

            const files = [
                await uploadToGemini(
                    "/tmp/uploads/image2code/prompt_images/1.png",
                    "image/png"
                ),
                await uploadToGemini(
                    "/tmp/uploads/image2code/prompt_images/2.png",
                    "image/png"
                ),
                contentGeminiImage
            ];

            
            const parts = [
                {
                    text: 'You have been given an image and your task is to recognize, detect, and extract different types of HTML elements, all their attributes, and every type of CSS styling which can be recognized. Here are the HTML tags which should be recognized if present in the given image: [a, audio, body, br, button, canvas, caption, code, data, datalist, details, dialog, div, fieldset, footer, form, h1, h2, h3, h4, h5, h6, header, hr, i, iframe, img, input, label, legend, li, map, mark, menu, menuitem, meter, nav, object, ol, optgroup, option, p, param, pre, progress, section, select, small, source, span, strong, sub, summary, sup, table, tbody, td, textarea, tfoot, th, thead, title, tr, u, ul, video]. Also, detect each and every icon and its styles from the given image and suggest classes of FontAwesome 5 icons like \'fas fa-...\' and keep them in the class key, assuming each icon as an "i" tag.\n\nOnce you are done with recognition, detection, and extraction, provide all those details in a proper and predefined JSON format with key-value pairs (format provided below).\n\nPay special attention to these HTML tags with the following rules and instructions:\n>>\na -> Set the "href" attribute value of each recognized "a" tag to "#".\naudio -> Set the "src" attribute value of each recognized "audio" tag to "1.mp3".\nbody -> Detect the body background color, margins, and paddings carefully and precisely.\niframe -> Analyze and make a guess for the recognized iframe elements and attach a related link from the internet in the "src" attribute.\nimg -> Recognize the img tags and describe each respective image precisely and in the best way possible with respective image elements, objects, etc., but in less than 250 characters, and keep it in a single paragraph in the "alt" attribute of the respective "img" tag. keep the src tag empty of each img tag. If image width and height is not defined or recognized then must detect each and every image tag height and width and assign it to corresponding img tag. After all attempts if you are failed to get or even guess the width or height of any img then set its width attribute to 30% in corresponding img tag to maintain the structure of the page.\n\ntitle -> Analyze the given image and its contents and suggest the most appropriate text for the title of the page and store it in the innerText of the title tag.\nvideo -> Describe the respective thumbnails of each recognized video precisely and in the best way possible with its elements and objects, etc., but in less than 250 characters, and store it in the "alt" key of the respective video tag.\n<<\n\nMOST IMPORTANT INSTRUCTIONS AND RULES:\n-Must include fontawesome 5 cdn link and use fontawesome classes for all icons in image with "i" tag in the json structure\n- Image width and the height will be given to you along with image. Set that width and height of image as standard size and detect the width, height, positions, font sizes, paddings, margins, borders, border-radius, etc. of all elements and store them in the respective tag\'s \'style\' attribute in json structure.\n- Image background color will be given to you in hex color code. Match if the given background color through input is matching with image backg and if yes then set background color style of the body to this color in output json structure.\n- Include width, height, background color, font color, font size, and any other relevant CSS properties for each element in the JSON structure.\n- Keep track of font families.\n- Maintain the order of attributes in the JSON structure as they appear in the image.\n- Follow all the rules of the provided JSON structure and ensure proper matching of opening and closing braces.\n- Recognize parent-child relationships among tags and nest details accordingly.\n- Assign a unique but relatable "id" to each tag and element except the html tag, head, and its children, to facilitate CSS selectors.\n- Be strict with the given JSON structure and use \\" instead of " if used within attributes.\n- (MOST IMPORTANT AND MUST) Detect and recognize the different colors of various elements (background colors, font colors, border colors, etc.) precisely and accurately. Include these colors in the respective element\'s style attribute in the JSON structure.\n- must detect and include width, height, background color, color, font size of all elements in json structure\n- Always detect the body background color accurately for each image.\n- Make sure to manage the responsive design styling for all devices like smartphones, tablets and laptops or desktops\n\nHeres the json structure for output:\n```json\n{\n  "html": {\n    "tag": "html",\n    "attributes": {\n      "lang": "en"\n    },\n    "children": {\n      "head": {\n        "tag": "head",\n        "attributes": {},\n        "children": {\n          "meta": {\n            "tag": "meta",\n            "attributes": {\n              "charset": "UTF-8"\n            }\n          },\n          "title": {\n            "tag": "title",\n            "attributes": {},\n            "innerText": "Example Page"\n          },\n          "style": {\n            "tag": "style",\n            "attributes": {},\n            "innerText": "body { font-family: Arial, sans-serif; background-color: [detect background-color of the image]; }"\n          }\n        }\n      },\n      "body": {\n        "tag": "body",\n        "attributes": {\n          "id": "bdy-7d68"\n        },\n        "children": {\n          "header": {\n            "tag": "header",\n            "attributes": {\n              "id": "main-header"\n            },\n            "children": {\n              "h1": {\n                "tag": "h1",\n                "attributes": {\n                  "id": "h1-a261"\n                },\n                "innerText": "Welcome to Example Website"\n              },\n              "nav": {\n                "tag": "nav",\n                "attributes": {\n                  "role": "navigation",\n                  "id": "nav-65cb"\n                },\n                "children": {\n                  "ul": {\n                    "tag": "ul",\n                    "attributes": {\n                      "class": "menu",\n                      "id": "ul-9db4"\n                    },\n                    "children": {\n                      "li1": {\n                        "tag": "li",\n                        "attributes": {\n                          "id": "li-489c"\n                        },\n                        "innerText": "Home"\n                      },\n                      "li2": {\n                        "tag": "li",\n                        "attributes": {\n                          "id": "li-56a1"\n                        },\n                        "innerText": "About Us"\n                      },\n                      "li3": {\n                        "tag": "li",\n                        "attributes": {\n                          "id": "li-3d2d"\n                        },\n                        "innerText": "Contact"\n                      }\n                    }\n                  }\n                }\n              }\n            }\n          },\n          "main": {\n            "tag": "main",\n            "attributes": {\n              "id": "content"\n            },\n            "children": {\n              "article1": {\n                "tag": "article",\n                "attributes": {\n                  "class": "post",\n                  "id": "art-c2d8"\n                },\n                "children": {\n                  "h2": {\n                    "tag": "h2",\n                    "attributes": {\n                      "id": "h2-85db"\n                    },\n                    "innerText": "First Post"\n                  },\n                  "p": {\n                    "tag": "p",\n                    "attributes": {\n                      "id": "p-1a57",\n                      "style": "text-align:center;"\n                    },\n                    "innerText": "This is the content of the first article."\n                  },\n                  "img1": {\n                    "tag": "img",\n                    "attributes": {\n                      "src": "",\n                      "alt": "Image described",\n                      "id": "img-3c6a"\n                    }\n                  },\n                  "a1": {\n                    "tag": "a",\n                    "attributes": {\n                      "href": "#",\n                      "id": "a-853f"\n                    },\n                    "innerText": "Read More"\n                  },\n                  "video1": {\n                    "tag": "video",\n                    "attributes": {\n                      "controls": true,\n                      "data-alt": "Video 1",\n                      "id": "vid-52bc"\n                    },\n                    "children": {\n                      "source1": {\n                        "tag": "source",\n                        "attributes": {\n                          "src": "video1.mp4",\n                          "type": "video/mp4",\n                          "id": "src-91f2"\n                        }\n                      }\n                    }\n                  }\n                }\n              },\n              "article2": {\n                "tag": "article",\n                "attributes": {\n                  "class": "post",\n                  "id": "art-261d"\n                },\n                "children": {\n                  "p": {\n                    "tag": "p",\n                    "attributes": {\n                      "innerText": "This is an example paragraph",\n                      "id": "p-753a"\n                    }\n                  },\n                  "input": {\n                    "tag": "input",\n                    "attributes": {\n                      "type": "text",\n                      "id": "inp-2cb6"\n                    }\n                  }\n                }\n              }\n            }\n          },\n          "footer": {\n          "tag": "footer",\n          "attributes": {\n            "id": "ftr-35ab"\n          },\n          "children": {\n            "p": {\n              "tag": "p",\n              "attributes": {\n                "id": "p-5cd1"\n              },\n              "innerText": "© 2024 Example Website. All rights reserved."\n            }\n          }\n        }\n        },\n      }\n    }\n  }\n}\n```'
                },
                {
                    text: "image: "
                },
                {
                    fileData: {
                        mimeType: files[0].mimeType,
                        fileUri: files[0].uri
                    }
                },
                {
                    text: "backgroundColor: #FF6347"
                },
                {
                    text: "width: 1079"
                },
                {
                    text: "height: 2190"
                },
                {
                    text: 'output: ```json\n{\n  "html": {\n    "tag": "html",\n    "attributes": {\n      "lang": "en"\n    },\n    "children": {\n      "head1": {\n        "tag": "head",\n        "attributes": {},\n        "children": {\n          "meta1": {\n            "tag": "meta",\n            "attributes": {\n              "charset": "UTF-8"\n            }\n          },\n          "meta2": {\n            "tag": "meta",\n            "attributes": {\n              "name": "viewport",\n              "content": "width=device-width, initial-scale=1.0"\n            }\n          },\n          "title3": {\n            "tag": "title",\n            "attributes": {},\n            "children": {},\n            "innerText": "Codylo"\n          },\n          "link4": {\n            "tag": "link",\n            "attributes": {\n              "rel": "stylesheet",\n              "href": "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"\n            }\n          },\n          "style5": {\n            "tag": "style",\n            "attributes": {},\n            "children": {},\n            "innerText": "body {\\n            background-color: tomato;\\n            font-family: sans-serif;\\n        }\\n        .container {\\n            width: 80%;\\n            margin: 0 auto;\\n            padding: 20px;\\n        }\\n        nav {\\n            display: flex;\\n            justify-content: space-between;\\n            align-items: center;\\n            padding: 10px;\\n        }\\n        .nav-left {\\n            display: flex;\\n            align-items: center;\\n        }\\n        .nav-right {\\n            display: flex;\\n            align-items: center;\\n        }\\n        .nav-right i {\\n            margin-left: 10px;\\n            font-size: 20px;\\n        }\\n        .form-container {\\n            margin-top: 20px;\\n        }\\n        .form-container label {\\n            display: block;\\n            margin-bottom: 5px;\\n        }\\n        .form-container input[type=\\"text\\"],\\n        .form-container input[type=\\"email\\"],\\n        .form-container input[type=\\"password\\"] {\\n            width: 100%;\\n            padding: 10px;\\n            margin-bottom: 10px;\\n            border: 1px solid #ccc;\\n            border-radius: 5px;\\n        }\\n        .form-container input[type=\\"radio\\"] {\\n            margin-right: 5px;\\n        }\\n        .form-container input[type=\\"checkbox\\"] {\\n            margin-right: 5px;\\n        }\\n        .ai-text {\\n            font-family: monospace;\\n            margin-top: 20px;\\n        }\\n        .select-container {\\n            margin-top: 20px;\\n        }"\n          }\n        }\n      },\n      "body2": {\n        "tag": "body",\n        "attributes": {},\n        "children": {\n          "div1": {\n            "tag": "div",\n            "attributes": {\n              "class": "container"\n            },\n            "children": {\n              "nav1": {\n                "tag": "nav",\n                "attributes": {},\n                "children": {\n                  "div1": {\n                    "tag": "div",\n                    "attributes": {\n                      "class": "nav-left"\n                    },\n                    "children": {\n                      "strong1": {\n                        "tag": "strong",\n                        "attributes": {},\n                        "children": {},\n                        "innerText": "Codylo"\n                      }\n                    }\n                  },\n                  "div2": {\n                    "tag": "div",\n                    "attributes": {\n                      "class": "nav-right"\n                    },\n                    "children": {\n                      "i1": {\n                        "tag": "i",\n                        "attributes": {\n                          "class": "fas fa-home"\n                        }\n                      },\n                      "i2": {\n                        "tag": "i",\n                        "attributes": {\n                          "class": "fas fa-phone"\n                        }\n                      },\n                      "i3": {\n                        "tag": "i",\n                        "attributes": {\n                          "class": "fas fa-user"\n                        }\n                      },\n                      "i4": {\n                        "tag": "i",\n                        "attributes": {\n                          "class": "fas fa-info-circle"\n                        }\n                      },\n                      "i5": {\n                        "tag": "i",\n                        "attributes": {\n                          "class": "fas fa-ellipsis-v"\n                        }\n                      }\n                    }\n                  }\n                }\n              },\n              "img2": {\n                "tag": "img",\n                "attributes": {\n                  "src": "",\n                  "width": "100",\n                  "alt": "The image you sent is a close-up of a sunflower in a field. The sunflower is the most prominent element in the image, taking up most of the frame. It has a large, round head with bright yellow petals and a dark brown center. The sunflower\'s stem is thick and hairy, and there are faint green leaves visible in the background.\\n"\n                }\n              },\n              "div3": {\n                "tag": "div",\n                "attributes": {\n                  "class": "form-container"\n                },\n                "children": {\n                  "label1": {\n                    "tag": "label",\n                    "attributes": {\n                      "for": "name"\n                    },\n                    "children": {},\n                    "innerText": "Name:"\n                  },\n                  "input2": {\n                    "tag": "input",\n                    "attributes": {\n                      "type": "text",\n                      "id": "name",\n                      "name": "name"\n                    }\n                  },\n                  "label3": {\n                    "tag": "label",\n                    "attributes": {\n                      "for": "email"\n                    },\n                    "children": {},\n                    "innerText": "Email:"\n                  },\n                  "input4": {\n                    "tag": "input",\n                    "attributes": {\n                      "type": "email",\n                      "id": "email",\n                      "name": "email"\n                    }\n                  },\n                  "label5": {\n                    "tag": "label",\n                    "attributes": {\n                      "for": "password"\n                    },\n                    "children": {},\n                    "innerText": "Password:"\n                  },\n                  "input6": {\n                    "tag": "input",\n                    "attributes": {\n                      "type": "password",\n                      "id": "password",\n                      "name": "password"\n                    }\n                  },\n                  "label7": {\n                    "tag": "label",\n                    "attributes": {},\n                    "children": {},\n                    "innerText": "Gender:"\n                  },\n                  "input8": {\n                    "tag": "input",\n                    "attributes": {\n                      "type": "radio",\n                      "id": "male",\n                      "name": "gender",\n                      "value": "male"\n                    }\n                  },\n                  "label9": {\n                    "tag": "label",\n                    "attributes": {\n                      "for": "male"\n                    },\n                    "children": {},\n                    "innerText": "Male"\n                  },\n                  "input10": {\n                    "tag": "input",\n                    "attributes": {\n                      "type": "radio",\n                      "id": "female",\n                      "name": "gender",\n                      "value": "female"\n                    }\n                  },\n                  "label11": {\n                    "tag": "label",\n                    "attributes": {\n                      "for": "female"\n                    },\n                    "children": {},\n                    "innerText": "Female"\n                  },\n                  "input12": {\n                    "tag": "input",\n                    "attributes": {\n                      "type": "checkbox",\n                      "id": "terms",\n                      "name": "terms"\n                    }\n                  },\n                  "label13": {\n                    "tag": "label",\n                    "attributes": {\n                      "for": "terms"\n                    },\n                    "children": {},\n                    "innerText": "Accept Terms and Conditions"\n                  }\n                }\n              },\n              "div4": {\n                "tag": "div",\n                "attributes": {\n                  "class": "ai-text"\n                },\n                "children": {\n                  "p1": {\n                    "tag": "p",\n                    "attributes": {},\n                    "children": {},\n                    "innerText": "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by humans and animals."\n                  },\n                  "p2": {\n                    "tag": "p",\n                    "attributes": {},\n                    "children": {},\n                    "innerText": "The term \\"artificial intelligence\\" was coined in 1956 by John McCarthy, who also organized the Dartmouth Summer Research Project on Artificial Intelligence, which is widely considered to be the birthplace of AI as a field."\n                  }\n                }\n              },\n              "div5": {\n                "tag": "div",\n                "attributes": {\n                  "class": "select-container"\n                },\n                "children": {\n                  "select1": {\n                    "tag": "select",\n                    "attributes": {},\n                    "children": {\n                      "option1": {\n                        "tag": "option",\n                        "attributes": {\n                          "value": "agree",\n                          "selected": ""\n                        },\n                        "children": {},\n                        "innerText": "Agree"\n                      },\n                      "option2": {\n                        "tag": "option",\n                        "attributes": {\n                          "value": "disagree"\n                        },\n                        "children": {},\n                        "innerText": "Disagree"\n                      }\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n```'
                },
                {
                    text: "image: "
                },
                {
                    fileData: {
                        mimeType: files[1].mimeType,
                        fileUri: files[1].uri
                    }
                },
                {
                    text: "backgroundColor: #000000"
                },
                {
                    text: "width: 1079"
                },
                {
                    text: "height: 2253"
                },
                {
                    text: 'output: ```json\n{\n  "html": {\n    "tag": "html",\n    "attributes": {\n      "lang": "en"\n    },\n    "children": {\n      "head1": {\n        "tag": "head",\n        "attributes": {},\n        "children": {\n          "meta1": {\n            "tag": "meta",\n            "attributes": {\n              "charset": "UTF-8"\n            }\n          },\n          "meta2": {\n            "tag": "meta",\n            "attributes": {\n              "name": "viewport",\n              "content": "width=device-width, initial-scale=1.0"\n            }\n          },\n          "title3": {\n            "tag": "title",\n            "attributes": {},\n            "children": {},\n            "innerText": "IT Club Website"\n          },\n          "link4": {\n            "tag": "link",\n            "attributes": {\n              "rel": "stylesheet",\n              "href": "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.5.0/css/all.min.css",\n              "integrity": "sha512-QfDd74mlg8afgSqm3Vq2Q65e9b3xMhJB4GZ9OcHDVy1hZ6pqBJPWWnMsKDXM7NINoKqJANNGBuVRIpIJ5dogfA==",\n              "crossorigin": "anonymous",\n              "referrerpolicy": "no-referrer"\n            }\n          },\n          "style5": {\n            "tag": "style",\n            "attributes": {},\n            "children": {},\n            "innerText": "body {\\n            background-color: black;\\n            color: white;\\n            font-family: Arial, sans-serif;\\n            margin: 0;\\n            padding: 0;\\n        }\\n        .top-bar {\\n            display: flex;\\n            justify-content: space-between;\\n            align-items: center;\\n            padding: 10px 20px;\\n            background-color: #333;\\n            color: white;\\n        }\\n        .logo {\\n            font-size: 1.2em;\\n        }\\n        .search-icon, .menu-icon {\\n            cursor: pointer;\\n            color: white;\\n        }\\n        .header-image {\\n            text-align: center;\\n            margin-top: 20px;\\n        }\\n        .header-image img {\\n            max-width: 100%;\\n            height: auto;\\n        }\\n        .intro-text {\\n            text-align: center;\\n            margin: 20px auto;\\n            max-width: 80%;\\n            line-height: 1.6;\\n        }\\n        .intro-text p:first-letter {\\n            font-size: 150%;\\n        }\\n        .explore-button {\\n            display: inline-block;\\n            background-color: #4CAF50;\\n            color: white;\\n            text-align: center;\\n            padding: 10px 20px;\\n            text-decoration: none;\\n            border-radius: 5px;\\n            margin-top: 20px;\\n        }\\n        .explore-button i {\\n            margin-left: 5px;\\n        }\\n        hr {\\n            border-color: #666;\\n            margin: 40px auto;\\n            max-width: 80%;\\n        }\\n        .notices {\\n            text-align: center;\\n        }\\n        .notices h4 {\\n            font-size: 1.5em;\\n        }\\n        .notices ul {\\n            list-style: none;\\n            padding: 0;\\n        }\\n        .notices li {\\n            background-color: #222;\\n            color: white;\\n            border: 1px solid #444;\\n            padding: 10px;\\n            margin: 10px;\\n        }"\n          }\n        }\n      },\n      "body2": {\n        "tag": "body",\n        "attributes": {},\n        "children": {\n          "div1": {\n            "tag": "div",\n            "attributes": {\n              "class": "top-bar"\n            },\n            "children": {\n              "div1": {\n                "tag": "div",\n                "attributes": {\n                  "class": "search-icon"\n                },\n                "children": {\n                  "i1": {\n                    "tag": "i",\n                    "attributes": {\n                      "class": "fas fa-search"\n                    }\n                  }\n                }\n              },\n              "div2": {\n                "tag": "div",\n                "attributes": {\n                  "class": "logo"\n                },\n                "children": {},\n                "innerText": "IT Club"\n              },\n              "div3": {\n                "tag": "div",\n                "attributes": {\n                  "class": "menu-icon"\n                },\n                "children": {\n                  "i1": {\n                    "tag": "i",\n                    "attributes": {\n                      "class": "fas fa-bars"\n                    }\n                  }\n                }\n              }\n            }\n          },\n          "div2": {\n            "tag": "div",\n            "attributes": {\n              "class": "header-image"\n            },\n            "children": {\n              "img1": {\n                "tag": "img",\n                "attributes": {\n                  "src": "",\n                  "alt": "The image you sent is a vector illustration of a blue clock with red hands and numbers on a black background. The clock is surrounded by various other clocks and icons in different shapes and sizes. There are also regions of text in the image, including numbers, letters, and possibly a brand name."\n                }\n              }\n            }\n          },\n          "div3": {\n            "tag": "div",\n            "attributes": {\n              "class": "intro-text"\n            },\n            "children": {\n              "p1": {\n                "tag": "p",\n                "attributes": {},\n                "children": {},\n                "innerText": "IT Club is Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla pretium, justo nec tincidunt auctor, risus nisi mollis nulla."\n              }\n            }\n          },\n          "div4": {\n            "tag": "div",\n            "attributes": {\n              "style": "text-align:center;"\n            },\n            "children": {\n              "a1": {\n                "tag": "a",\n                "attributes": {\n                  "href": "#",\n                  "class": "explore-button"\n                },\n                "children": {\n                  "i1": {\n                    "tag": "i",\n                    "attributes": {\n                      "class": "fas fa-arrow-right"\n                    }\n                  }\n                },\n                "innerText": "Explore Blogs"\n              }\n            }\n          },\n          "hr5": {\n            "tag": "hr",\n            "attributes": {}\n          },\n          "div6": {\n            "tag": "div",\n            "attributes": {\n              "class": "notices"\n            },\n            "children": {\n              "h41": {\n                "tag": "h4",\n                "attributes": {},\n                "children": {},\n                "innerText": "Notices"\n              },\n              "ul2": {\n                "tag": "ul",\n                "attributes": {},\n                "children": {\n                  "li1": {\n                    "tag": "li",\n                    "attributes": {},\n                    "children": {},\n                    "innerText": "Notice 1 (7 May 2024)"\n                  },\n                  "li2": {\n                    "tag": "li",\n                    "attributes": {},\n                    "children": {},\n                    "innerText": "Notice 2 (8 May 2024)"\n                  },\n                  "li3": {\n                    "tag": "li",\n                    "attributes": {},\n                    "children": {},\n                    "innerText": "Notice 3 (9 May 2024)"\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n```'
                },
                {
                    text: "image: "
                },
                {
                    fileData: {
                        mimeType: files[2].mimeType,
                        fileUri: files[2].uri
                    }
                },
                {
                    text: `backgroundColor: ${req.body.bgcolor}`
                },
                {
                    text: `width: ${req.body.width}`
                },
                {
                    text: `height: ${req.body.height}`
                },
                {
                    text: "output: "
                }
            ];

            try {
                const generationConfig = {
                    temperature: req.body.temperature || 1,
                    topP: req.body.topP || 0.95,
                    topK: req.body.topK || 64,
                    maxOutputTokens: req.body.maxOutputTokens || 15000,
                    responseMimeType: "text/plain"
                };

                const model = await genAI.getGenerativeModel({
                    model: req.body.model || "gemini-1.5-flash",
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
                    ]
                });

                const generatedText = await model.generateContent({
                    contents: [{ role: "user", parts }]
                });
                fs.unlink(uploadedFilePath, (err) => { if (err) {}
                })
                res.json({
                    message: "JSON Generated",
                    status: "success",
                    data: generatedText,
                    promptImage: contentGeminiImage
                });
            } catch (error) {
                if (error.status === 429) {
                    try {
                        const generationConfig = {
                            temperature: req.body.temperature || 1,
                            topP: req.body.topP || 0.95,
                            topK: req.body.topK || 64,
                            maxOutputTokens: req.body.maxOutputTokens || 15000,
                            responseMimeType: "text/plain"
                        };

                        const model = await genAI.getGenerativeModel({
                            model: req.body.model || "gemini-1.0-pro",
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
                            ]
                        });

                        const generatedText = await model.generateContent({
                            contents: [{ role: "user", parts }]
                        });
                        res.json({
                            message: "JSON Generated",
                            status: "success",
                            data: generatedText
                        });
                    } catch (error) {
                        return res.json({
                            error:
                                "Error generating code: " +
                                error.message.replace(
                                    "[GoogleGenerativeAI Error]:",
                                    ""
                                )
                        });
                    }
                }
                return res.json({
                    error:
                        "Error generating code: " +
                        error.message.replace("[GoogleGenerativeAI Error]:", "")
                });
            }
        } catch (error) {
            console.error("Error:", error);
            res.status(500).send("Error uploading file and generating content");
        }
    }
);

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
