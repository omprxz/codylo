const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

mongoose.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  currentTime: () => new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"})
});

const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  feedback: {type: String, maxlength: 1000}
})

const Feedback = mongoose.model('Feedback', feedbackSchema, 'feedbacks')

module.exports = Feedback