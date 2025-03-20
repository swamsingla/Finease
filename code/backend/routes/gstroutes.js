const express = require("express");
const router = express.Router();
const gstController = require("../controllers/gstcontroller");

// POST endpoint to submit GST data
router.post("/api/gst", gstController.submitGSTData);

// GET endpoint to fetch GST data
router.get("/api/gst", gstController.getGSTData);

module.exports = router;