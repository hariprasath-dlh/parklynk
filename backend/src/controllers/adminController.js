const User = require('../models/User');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const asyncHandler = require('../utils/asyncHandler');

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        count: users.length,
        data: users,
    });
});

const getAllBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({})
        .populate('user', 'name email')
        .populate('slot', 'title')
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
    });
});

const getPlatformStats = asyncHandler(async (req, res) => {
    const [totalUsers, totalOwners, totalBookings, revenueStats] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ role: 'owner' }),
        Booking.countDocuments({}),
        Booking.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalPlatformEarnings: { $sum: '$platformFee' },
                },
            },
        ]),
    ]);

    const totals = revenueStats[0] || {
        totalRevenue: 0,
        totalPlatformEarnings: 0,
    };

    return res.status(200).json({
        success: true,
        data: {
            totalUsers,
            totalOwners,
            totalBookings,
            totalRevenue: totals.totalRevenue,
            totalPlatformEarnings: totals.totalPlatformEarnings,
        },
    });
});

const toggleUserStatus = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
        success: true,
        data: user,
    });
});

const toggleSlotStatus = asyncHandler(async (req, res) => {
    const slotId = req.params.id;

    const slot = await ParkingSlot.findById(slotId);
    if (!slot) {
        return res.status(404).json({
            success: false,
            message: 'Parking slot not found',
        });
    }

    slot.isActive = !slot.isActive;
    await slot.save();

    return res.status(200).json({
        success: true,
        data: slot,
    });
});

module.exports = {
    getAllUsers,
    getAllBookings,
    getPlatformStats,
    toggleUserStatus,
    toggleSlotStatus,
};
