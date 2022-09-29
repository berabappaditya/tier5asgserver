const mongoose = require("mongoose");
const schema = mongoose.Schema;
const userSchema = new schema({
  userName: {
    type: String,
    required: true,
    min: 3,
    max: 225,
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 225,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 225,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});
module.exports = mongoose.model("user", userSchema);
