const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');


const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/files");


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

const Schema = mongoose.Schema;
const feedbackSchema = new Schema({
  name: String,
  email: String,
  feedback: {type: String, maxlength: 1000}
})
const Feedback = mongoose.model('Feedback', feedbackSchema)

const saveFeedback = async (name, email, feedback) => {
  const newFeedback = new Feedback({name, email, feedback})
  newFeedback.save().then(
    fb => {
      console.log(fb)
    }
    )
    .catch(err => console.log(err))
}

const app = express();
const port = process.env.PORT || 3300;

app.use(express.json());
app.use(cors());

async function sendEmail(name, email, text, recipientEmail, from, passPath) {
  const password = process.env[passPath];
 
    let subject = `New suggestion from Codylo user - ${name}`;
    let content = `Message: ${text}\n\nName: ${name}\nEmail: ${email} \n
    `;
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
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
    const newFb = await saveFeedback(name, email, text)
    return { message: 'Email sent successfully' };
  } catch (err) {
    throw err;
  }
}

app.post('/api/sendFeedbackMail', async (req, res) => {
  const { name, email, text
  } = req.body;

  try {
    const result = await sendEmail(name, email, text, 'omprxz@gmail.com', 'ompkr69@gmail.com', 'GMAIL_APP_PASSWORD_FB');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.get('/image', (req, res) => {
  /*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 *
 * See the getting started guide for more information
 * https://ai.google.dev/gemini-api/docs/get-started/node
 */
const apiKey = process.env.GEMINI_API_KEY;
console.log(apiKey)
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

/**
 * Uploads the given file to Gemini.
 *
 * See https://ai.google.dev/gemini-api/docs/prompting_with_media
 */
async function uploadToGemini(path, mimeType) {
  console.log('path ',path,' mimeType ',mimeType)
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
}

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run() {
  // TODO Make these files available on the local file system
  // You may need to update the file paths
  const files = [
    await uploadToGemini("./IMG_20240616_174208.jpg", "image/jpeg"),
    await uploadToGemini("./Screenshot_2024_0610_170000.png", "image/jpeg"),
  ];

  const parts = [
    {text: "You have been tasked with analyzing an image provided to you to provide detailed specifications for recreating a webpage. So begin from this given image and give details and information only don't give html css js code instead. Begin by examining the typography: note the font size, family, and color used for text elements. Identify any borders present, noting their size and border radius. Measure the dimensions of various elements within the image, including widths and heights of containers, images, or other visual components.\n\nExamine the color scheme used throughout the image, identifying primary and secondary colors as well as any gradients or patterns employed. Note the spacing and alignment of text and other elements to maintain consistency in layout. Evaluate the use of shadows, gradients, or other effects applied to elements for visual depth.\n\nAssess the overall layout structure, including the arrangement of elements relative to each other and the use of grids or columns. Determine if the design incorporates responsive principles by identifying breakpoints or adaptive layout techniques. \n\nBy compiling these detailed specifications, you provide a comprehensive blueprint for recreating a webpage that mirrors the visual design and functionality of the original image, ensuring accuracy and fidelity to the desired aesthetic."},
    {text: "input: "},
    {
      fileData: {
        mimeType: files[0].mimeType,
        fileUri: files[0].uri,
      },
    },
    {text: "\n\ngive me detailed information about this image"},
    {text: "output: this image has body background color white and a top bar with Brand name 'Marked' and a hamburger three horizontal line menu with justify content : space-between and some horizontal padding of like 8px after that top bar theres a text center h3 heading with text 'Attendance'  after that theres a text on left side with text 'Select Subjects:' amd after that there are three checkboxes with labels in horizontally with texts 'All', 'DBMS' and 'Python' respectively with some gapping between each other.\nafter that in the new line theres a badge with background dark gray and padding 3px with white semibold text 'Total Periods: 2'\nand then in the next line three badges with Blue, green and red & 'Present:1', 'Percentage: 50.00%' and 'Absent:1' text respectively with gappimg between each other of 8px\nafter that in next line theres a table with only horizontal rows border of color light grey 1px. headings of this table are 'Date', 'Time' and 'Subject Name' respectively and these headings are in bold and table data is in two rows. first row data is '2024-06-01' , '09:33>42' and 'Python' and secomd row data is '2024-06-08', '15:42:30' and 'Pyyhon'"},
    {text: "input: "},
    {
      fileData: {
        mimeType: files[1].mimeType,
        fileUri: files[1].uri,
      },
    },
    {text: "\n\ngive me detailed information about this image"},
    {text: "output: "},
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
 // safetySettings: Adjust safety settings
 // See https://ai.google.dev/gemini-api/docs/safety-settings
  });
  console.log(result.response.text());
  res.send(result.response.text())
}

run();
  
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});