const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public", req.body.path || "/uploads");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const sanitizedFilename = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${sanitizedFilename}`);
  },
});

const upload = multer({ storage });

module.exports = upload;
