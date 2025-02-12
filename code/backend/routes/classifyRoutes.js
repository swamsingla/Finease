const express = require("express");
const multer = require("multer");
const { classifyDocument } = require("../controllers/classifyController");

const router = express.Router();

// ✅ Setup Multer for file uploads
const upload = multer({ dest: "uploads/" });

// ✅ Route to classify an uploaded document
router.post("/", upload.single("image"), classifyDocument);

module.exports = router;
