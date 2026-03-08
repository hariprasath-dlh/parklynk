const express = require('express');
const {
    getAllUsers,
    getAllBookings,
    getPlatformStats,
    toggleUserStatus,
    toggleSlotStatus,
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/users', getAllUsers);
router.get('/bookings', getAllBookings);
router.get('/stats', getPlatformStats);
router.patch('/users/:id/toggle', toggleUserStatus);
router.patch('/slots/:id/toggle', toggleSlotStatus);

module.exports = router;
