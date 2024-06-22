const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  feedback: {type: String, maxlength: 1000}
})

const Feedback = mongoose.model('Feedback', feedbackSchema, 'feedbacks')

module.exports = Feedback