const express = require("express");
const router = express.Router();
const itrController = require("../controllers/itrcontroller");

// POST endpoint to submit ITR data
router.post("/api/itr", itrController.submitITRData);

router.get("/api/itr" , itrController.getITRData);

module.exports = router;