var mongoose = require('mongoose');
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
    sessionKey: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
      },
    updatedAt: {
        type: Date,
    }
});

module.exports = mongoose.model('User', userSchema, 'User');