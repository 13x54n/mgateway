const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const File = require("../models/file.model");

exports.uploadFile = (req, res) => {
  const filePath = path.join(
    __dirname,
    "../public",
    req.body.path || "/uploads",
    req.file.filename
  );

  exec(`bash ./scripts/add-file.sh "${filePath}"`, async (error, stdout) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      return res.status(500).send({
        error: "Script execution failed",
        details: error.message,
      });
    }

    const ipfsHash = stdout.trim();

    try {
      const file = new File({
        filename: req.file.filename,
        path: filePath,
        ipfsHash,
      });
      await file.save();

      fs.unlink(filePath, (unlinkError) => {
        if (unlinkError) {
          console.error(`Error deleting file: ${unlinkError.message}`);
          return res.status(500).send({
            message: "File uploaded but failed to delete the local file",
            ipfsHash,
            error: unlinkError.message,
          });
        }

        res.send({
          message:
            "File uploaded, script executed, and local file deleted successfully!",
          ipfsHash,
        });
      });
    } catch (dbError) {
      console.error("Error saving file to MongoDB:", dbError);
      res.status(500).send({
        message: "Failed to save file metadata to MongoDB",
        error: dbError.message,
      });
    }
  });
};
