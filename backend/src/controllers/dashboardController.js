const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');

const getOwnerDashboard = asyncHandler(async (req, res) => {
    if (!req.user || req.user.role !== 'owner') {
        return res.status(403).json({
            success: false,
            message: 'Only owners can access dashboard data',
        });
    }

    const bookings = await Booking.find({})
        .populate({
            path: 'slot',
            select: 'owner',
            match: { owner: req.user._id },
        })
        .select('status totalAmount platformFee');

    const ownerBookings = bookings.filter((booking) => booking.slot);

    const totalBookings = ownerBookings.length;
    const activeBookings = ownerBookings.filter(
        (booking) => booking.status === 'Active'
    ).length;
    const completedBookings = ownerBookings.filter(
        (booking) => booking.status === 'Completed'
    ).length;

    const totalRevenue = ownerBookings.reduce(
        (sum, booking) => sum + (booking.totalAmount || 0),
        0
    );
    const totalPlatformFees = ownerBookings.reduce(
        (sum, booking) => sum + (booking.platformFee || 0),
        0
    );
    const netEarnings = totalRevenue - totalPlatformFees;

    return res.status(200).json({
        success: true,
        data: {
            totalBookings,
            activeBookings,
            completedBookings,
            totalRevenue,
            totalPlatformFees,
            netEarnings,
            pendingDues: req.user.pendingDues || 0,
            settlementHistory: req.user.settlementHistory || [],
        },
    });
});

module.exports = { getOwnerDashboard };
