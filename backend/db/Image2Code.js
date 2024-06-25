const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const image2codeSchema = new mongoose.Schema({
  imageurl: String,
  functionality: String,
  cssframework: String,
  usejquery: Boolean,
  ip: String
}, { timestamps: true })

const Image2CodeModel = mongoose.model('Image2Code', image2codeSchema, 'image2code')

module.exports = Image2CodeModel;