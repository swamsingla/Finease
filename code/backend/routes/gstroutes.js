const express = require("express");
const router = express.Router();
const gstController = require("../controllers/gstcontroller");

// POST endpoint to submit GST data
router.post("/api/gst", gstController.submitGSTData);

module.exports = router;