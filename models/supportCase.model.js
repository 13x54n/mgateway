const mongoose = require("mongoose");

const supportCaseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: Array, default: [] },
    user: String,
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportCase", supportCaseSchema);
