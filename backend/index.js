const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});