const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const auth = require('../middleware/auth');

// Routes that require authentication
router.post('/save', fileController.saveFile);
router.get('/', auth, fileController.getFiles);
router.get('/:id', auth, fileController.getFile);
router.get('/download/:id', auth, fileController.downloadFile);
router.post('/authenticate-whatsapp', fileController.authenticateWhatsApp);

module.exports = router;
