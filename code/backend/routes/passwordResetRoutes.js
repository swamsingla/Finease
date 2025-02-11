const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');

router.post('/request-reset', passwordResetController.requestPasswordReset);
router.post('/verify-otp', passwordResetController.verifyOTP);
router.post('/reset-password', passwordResetController.resetPassword);

module.exports = router;
