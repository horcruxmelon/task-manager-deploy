const express = require('express');
const router = express.Router();

const {
  login,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');


// router.post('/signup', signup); // Public signup disabled
router.post('/login', login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

const authMiddleware = require('../middleware/authMiddleware');
const { changePassword, updateProfile } = require('../controllers/authController');
router.post('/change-password', authMiddleware, changePassword);
router.put('/profile', authMiddleware, updateProfile);


module.exports = router;
