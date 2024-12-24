const express = require("express");
const router = express.Router();
const { uploadFile, getUserFiles, deleteFile, pinFileToIPFS } = require("../controllers/file.controller");
const upload = require("../middlewares/upload.middleware");

router.post("/store", upload.single("file"), uploadFile);
router.get("/files/:user", getUserFiles);

// Delete a file by ID
router.delete("/files/:fileId", deleteFile);

// Pin a file to IPFS
router.post("/files/:fileId/pin", pinFileToIPFS);

module.exports = router;
