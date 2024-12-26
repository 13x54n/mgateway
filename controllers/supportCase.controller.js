const SupportCase = require("../models/supportCase.model");
const fs = require("fs");

// Create a new support case
exports.createSupportCase = async (req, res) => {
    const { title, description, user } = req.body;
    const images = req.files ? req.files.map(file => file.path) : [];

    if (!title || !description || !user) {
        return res
            .status(400)
            .json({ error: "Title, description, and user are required." });
    }

    try {
        const newCase = new SupportCase({ title, description, images, user });
        await newCase.save();
        res.status(201).json({
            message: "Support case submitted successfully.",
            supportCase: newCase,
        });
        // now send a mail to the user that case is created
        
    } catch (error) {
        res
            .status(500)
            .json({ error: "Error saving support case.", details: error.message });
    }
};

// Get all support cases
exports.getSupportCases = async (req, res) => {
  try {
    const supportCases = await SupportCase.find();
    res.json(supportCases);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching support cases.", details: error.message });
  }
};

// Get all support cases for a specific user
exports.getSupportCasesByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const supportCases = await SupportCase.find({ user: userId });
    res.json(supportCases);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error fetching support cases for user.",
        details: error.message,
      });
  }
};

// Delete a support case by ID
exports.deleteSupportCase = async (req, res) => {
  const { id } = req.params;

  try {
    const supportCase = await SupportCase.findByIdAndDelete(id);
    if (!supportCase) {
      return res.status(404).json({ error: "Support case not found." });
    }

    // Remove image file if it exists
    if (supportCase.image && fs.existsSync(supportCase.image)) {
      fs.unlinkSync(supportCase.image);
    }

    res.json({
      message: "Support case deleted successfully.",
      deletedCase: supportCase,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting support case.", details: error.message });
  }
};
