const express = require('express');
const {
    registerUser,
    loginUser,
    getUserProfile,
    deleteAccount,
    verifyLicense,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.delete('/delete-account', protect, deleteAccount);
router.post('/verify-license', protect, verifyLicense);

module.exports = router;
