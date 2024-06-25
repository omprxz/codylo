const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  feedback: {type: String, maxlength: 1000}
}, { timestamps: true })

const Feedback = mongoose.model('Feedback', feedbackSchema, 'feedbacks')

module.exports = Feedback