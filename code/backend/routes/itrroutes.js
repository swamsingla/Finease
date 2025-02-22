const express = require("express");
const router = express.Router();
const itrController = require("../controllers/itrcontroller");

// POST endpoint to submit ITR data
router.post("/api/itr", itrController.submitITRData);

module.exports = router;