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

const Feedback = require("./db/Feedback");
const Image2CodeModel = require("./db/Image2Code");

const port = process.env.PORT || 3300;
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json());const corsOptions = {
    origin: ["http://localhost:3000", "https://codylo.vercel.app"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
//app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

let MONGO_URI;
if (process.env.NODE_ENV === 'production') {
  MONGO_URI = process.env.MONGO_URI;
} else {
  MONGO_URI = process.env.MONGO_URI_LOCAL;
}

mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected..."))
    .catch((err) => console.log(err));

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
            const projectId = req.body.projectId;
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
    const newFeedback = new Feedback({ name, email, feedback });
    newFeedback
        .save()
        .then((fb) => {
            console.log(fb);
        })
        .catch((err) => console.log(err));
};

async function sendEmail(name, email, text, recipientEmail, from, passPath) {
    const password = process.env[passPath];

    let subject = `New suggestion from Codylo user - ${name}`;
    let content = `Message: ${text}\n\nName: ${name}\nEmail: ${email} \n
    `;
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: from,
            pass: password
        }
    });

    const message = {
        from: from,
        to: recipientEmail,
        subject: subject,
        text: content
    };

    try {
        const info = await transporter.sendMail(message);
        const newFb = await saveFeedback(name, email, text);
        return { message: "Email sent successfully", status:"success" };
    } catch (err) {
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
        res.status(500).json({ error: "Failed to send email" });
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
        //console.log(req.body)
        const uploadedFileName = file.filename;
        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        try {
            const projectId = req.body.projectId;

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
    const dirPath = '/tmp/uploads/img2code/prompt_images';
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
            
            await getFileFromUrl(promptImgs[0], "1.png")
            await getFileFromUrl(promptImgs[1], "2.png")

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

app.post("/api/image2code/json", (req, res) => {
    const { projectId, jsonData, jsonType } = req.body;

    if (!projectId || !jsonData) {
        return res.status(400).send("projectId and jsonData are required");
    }

    const dirPath = path.join(
        "/tmp",
        "uploads/image2code/" + jsonType + "_json"
    );
    const filePath = path.join(dirPath, `${projectId}.json`);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFile(filePath, JSON.stringify(jsonData), "utf8", (err) => {
        if (err) {
            return res.status(500).send("Error saving JSON data");
        }

        res.status(200).send("JSON data saved successfully");
    });
});

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
        //console.log(input);
        const output = await replicate.run("stability-ai/stable-diffusion-3", {
            input
        });
        //console.log(output);
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

app.post("/api/image2code/html", (req, res) => {
    const { projectId, htmlData, htmlType } = req.body;

    if (!projectId || !htmlData) {
        return res.status(400).send("projectId and htmlData are required");
    }

    const dirPath = path.join(
        "/tmp",
        "uploads/image2code/" + htmlType + "_html"
    );
    const filePath = path.join(dirPath, `${projectId}.html`);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFile(filePath, htmlData, "utf8", (err) => {
        if (err) {
            return res.status(500).send("Error saving HTML data");
        }

        res.status(200).send("HTML data saved successfully");
    });
});

// << APIS
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
