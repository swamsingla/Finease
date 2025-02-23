const express = require('express');
const router = express.Router();
const { createInvoice} = require('../controllers/invoiceController');
const { createEway } = require('../controllers/ewayController');

router.post('/create', createInvoice);
router.post('/eway/create', createEway);

module.exports = router;