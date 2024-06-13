const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3300;

app.use(express.json());
app.use(cors());

async function sendEmail(subject, textContent, recipientEmail, from, passPath) {
  const password = process.env[passPath];
  
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
    text: textContent,
  };

  try {
    const info = await transporter.sendMail(message);
    return { message: 'Email sent successfully' };
  } catch (err) {
    throw err;
  }
}

app.post('/sendFeedbackMail', async (req, res) => {
  const { subject, textContent, recipientEmail, from, passPath
  } = req.body;

  try {
    const result = await sendEmail(subject, textContent, recipientEmail, from, passPath);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});