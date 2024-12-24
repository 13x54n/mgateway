const express = require("express");
const router = express.Router();
const { uploadFile } = require("../controllers/file.controller");
const upload = require("../middlewares/upload.middleware");

router.post("/store", upload.single("file"), uploadFile);

module.exports = router;
