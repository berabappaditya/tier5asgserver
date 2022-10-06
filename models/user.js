const { boolean } = require("joi");
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
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  dashboard: {
    usagechart: {
      type: Boolean,
    },
    usagePie: {
      type: Boolean,
    },
    topUsage: {
      type: Boolean,
    },
  },
});
module.exports = mongoose.model("user", userSchema);
