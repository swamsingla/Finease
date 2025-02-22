const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { classifyDocument } = require("../controllers/classifyController");

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

// Configure multer to store files in the uploads directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Save files in the uploads directory
  },
  filename: function (req, file, cb) {
    // Use a unique filename to avoid conflicts
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

// Route to classify an uploaded document
router.post("/", upload.single("file"), classifyDocument);

module.exports = router;