const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  uploadedAt: { type: Date, default: Date.now },
  ipfsHash: String,
});

module.exports = mongoose.model("File", fileSchema);
