var mongoose = require('mongoose');
var fs = require('fs')
var Schema = mongoose.Schema;

var productSchema = new Schema({
  name: {
    type: String,
  },
  price:{
    type: Number,
  },
  inventory:{
    type: Number,
  },
  information: {
    type: String,
  },
  like:{
    type: Number,
  },
  comment: {
    type: String,
  },
  image: {
    data: {
      type: Buffer,
    },
    contentType: {
      type: String,
      default: 'image/png'
    }
  }
});

module.exports = mongoose.model('Product', productSchema, 'Product');