var mongoose = require('mongoose');
var fs = require('fs')
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    age:{
        type:Number
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    area: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
      },
      icon: {
        data: {
          type: Buffer,
          default: fs.readFileSync('./public/db/user.png')
        },
        contentType: {
          type: String,
          default: 'image/png'
        }
      }
});

module.exports = mongoose.model('User', userSchema, 'User');