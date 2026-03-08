const express = require('express');
const {
    createBooking,
    getUserBookings,
    getOwnerBookings,
    updateBookingStatus,
    confirmManualPayment,
    checkAndApplyOverstay,
} = require('../controllers/bookingController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/user', protect, getUserBookings);
router.get('/owner', protect, authorizeRoles('owner'), getOwnerBookings);
router.patch(
    '/:id/status',
    protect,
    authorizeRoles('owner'),
    updateBookingStatus
);
router.patch('/:id/pay', protect, confirmManualPayment);
router.get('/:id/check-overstay', protect, checkAndApplyOverstay);

module.exports = router;
