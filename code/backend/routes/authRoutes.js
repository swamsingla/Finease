const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const notificationsController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/update', auth, authController.updateProfile);
router.get('/notifications', notificationsController.getNotifications);

module.exports = router;
