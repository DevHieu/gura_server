const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      unique: false,
    },
    img: {
      type: String,
      required: true,
      unique: false,
    },
  },
  { timestamps: true }
);

const content = mongoose.model("Model", contentSchema, "guilddata");

module.exports = content;
