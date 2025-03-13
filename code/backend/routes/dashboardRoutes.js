const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// Get all user documents
router.get('/user-documents', auth, dashboardController.getUserDocuments);

// Get document statistics
router.get('/document-statistics', auth, dashboardController.getDocumentStatistics);

// Get monthly document data for charts
router.get('/monthly-data', auth, dashboardController.getMonthlyDocumentData);

module.exports = router;