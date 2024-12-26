const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  name: String,
  uploadedAt: { type: Date, default: Date.now },
  size: String,
  cid: String,
  user: String,
  pinned: { type: Boolean, default: false },
});

module.exports = mongoose.model("File", fileSchema);