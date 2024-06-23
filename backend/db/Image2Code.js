const mongoose = require('mongoose');

const image2codeSchema = new mongoose.Schema({
  imageurl: String,
  functionality: String,
  cssframework: String,
  usejquery: Boolean,
  ip: String
})

const Image2CodeModel = mongoose.model('Image2Code', image2codeSchema, 'image2code')

module.exports = Image2CodeModel;