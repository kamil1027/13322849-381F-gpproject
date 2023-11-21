var mongoose = require("mongoose");
var fs = require("fs");
var Schema = mongoose.Schema;

var historySchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  cart: [String], // Assuming cart items are stored as an array of strings
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("History", historySchema, "History");
