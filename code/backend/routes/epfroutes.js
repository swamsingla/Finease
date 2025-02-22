const express = require("express");
const router = express.Router();
const epfController = require("../controllers/epfcontroller");

// POST endpoint to submit EPF data
router.post("/api/epf", epfController.submitEPFData);

module.exports = router;