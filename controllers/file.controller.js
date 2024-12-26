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

  exec(
    `bash ./scripts/add-file.sh "${filePath.replace(/(["\s'$`\\])/g, "\\$1")}"`,
    async (error, stdout) => {
      if (error) {
        console.error(`Error executing script: ${error.message}`);
        return res.status(500).send({
          error: "Script execution failed",
          details: error.message,
        });
      }

      // ipfs hash is something like added QmNpr7ch73TDdFuK2BLMDxQxdj5uCEP2wSoXkm8Gb56bXo 1735047961494-logo.svg but i need only hash
      const ipfsHash = stdout.split(" ")[1].trim();

      try {
        const file = new File({
          name: req.file.filename,
          user: req.body.user,
          cid: ipfsHash,
          size: req.file.size,
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
            file,
          });
        });
      } catch (dbError) {
        console.error("Error saving file to MongoDB:", dbError);
        res.status(500).send({
          message: "Failed to save file metadata to MongoDB",
          error: dbError.message,
        });
      }
    }
  );
};

// Fetch all files uploaded by a user
exports.getUserFiles = async (req, res) => {
  const { user } = req.params;

  try {
    const files = await File.find({ user });
    res.status(200).send({ files });
  } catch (error) {
    console.error("Error fetching user files:", error);
    res.status(500).send({
      message: "Failed to fetch files",
      error: error.message,
    });
  }
};

// Delete a specific file by ID
exports.deleteFile = async (req, res) => {
  const { fileId } = req.params;

  try {
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }

    // Delete the file from MongoDB
    await File.deleteOne({ _id: fileId });

    // @dev need to delete from IPFS to pinning it

    res.status(200).send({
      message: "File deleted successfully",
      file,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).send({
      message: "Failed to delete file",
      error: error.message,
    });
  }
};

// Pin a file to IPFS
exports.pinFileToIPFS = (req, res) => {
  const { fileId } = req.params;

  File.findById(fileId)
    .then((file) => {
      if (!file) {
        return res.status(404).send({ message: "File not found" });
      }

      exec(`ipfs pin add ${file.cid}`, async (error, stdout, stderr) => {
        if (error) {
          console.error("Error pinning file to IPFS:", error.message);
          return res.status(500).send({
            message: "Failed to pin file to IPFS",
            error: error.message,
          });
        }

        try {
          file.pinned = true;
          await file.save();

          res.status(200).send({
            message: "File pinned to IPFS successfully!",
            cid: file.cid,
            output: stdout || stderr,
          });
        } catch (dbError) {
          console.error("Error updating file in MongoDB:", dbError);
          res.status(500).send({
            message: "Failed to update file metadata in MongoDB",
            error: dbError.message,
          });
        }
      });
    })
    .catch((error) => {
      console.error("Error finding file for pinning:", error);
      res.status(500).send({
        message: "Failed to pin file",
        error: error.message,
      });
    });
};
