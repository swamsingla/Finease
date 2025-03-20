const express = require("express");
const router = express.Router();
const epfController = require("../controllers/epfcontroller");

// POST endpoint to submit EPF data
router.post("/api/epf", epfController.submitEPFData);

// New EPF ECR routes
router.post("/api/epf/batch", epfController.createBatch);
router.post("/api/epf/employees", epfController.addEmployees);
router.get("/api/epf/batches", epfController.getBatches);
router.get("/api/epf/batch/:batchId", epfController.getBatchEmployees);
router.get("/api/epf/generate-ecr/:batchId", epfController.generateECR);
router.delete('/api/epf/employee/:id', epfController.deleteEmployee);

module.exports = router;