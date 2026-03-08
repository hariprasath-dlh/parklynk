const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');

const includesWeekend = (start, end) => {
    const cursor = new Date(start);
    const last = new Date(end);

    while (cursor <= last) {
        const day = cursor.getDay();
        if (day === 0 || day === 6) {
            return true;
        }
        cursor.setDate(cursor.getDate() + 1);
    }

    return false;
};

const createBooking = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, user context missing',
        });
    }

    const { slotId, startTime, endTime, vehicleNumber } = req.body || {};

    if (!slotId || !startTime || !endTime) {
        return res.status(400).json({
            success: false,
            message: 'Please provide slotId, startTime, and endTime',
        });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid startTime or endTime format',
        });
    }

    if (start >= end) {
        return res.status(400).json({
            success: false,
            message: 'startTime must be earlier than endTime',
        });
    }

    const slot = await ParkingSlot.findById(slotId);
    if (!slot) {
        return res.status(404).json({
            success: false,
            message: 'Parking slot not found',
        });
    }

    const overlappingBooking = await Booking.findOne({
        slot: slotId,
        status: { $in: ['Pending', 'Approved', 'Active'] },
        startTime: { $lt: end },
        endTime: { $gt: start },
    });

    if (overlappingBooking) {
        return res.status(400).json({
            success: false,
            message: 'Slot already booked for selected time range',
        });
    }

    const durationMs = end - start;
    const totalHours = durationMs / (1000 * 60 * 60);
    const totalDays = durationMs / (1000 * 60 * 60 * 24);

    const baseHourly = slot.pricing.baseHourly;
    const baseDaily = slot.pricing.baseDaily;
    const baseMonthly = slot.pricing.baseMonthly;
    const peakMultiplier = slot.pricing.peakMultiplier || 1;
    const weekendMultiplier = slot.pricing.weekendMultiplier || 1;

    let baseAmount = 0;

    if (totalDays >= 30) {
        const months = totalDays / 30;
        baseAmount = months * baseMonthly;
    } else if (totalHours >= 24) {
        baseAmount = totalDays * baseDaily;
    } else {
        baseAmount = totalHours * baseHourly;
    }

    if (includesWeekend(start, end)) {
        baseAmount *= weekendMultiplier;
    }

    baseAmount *= peakMultiplier;

    const platformFee = baseAmount * 0.1;
    const ownerEarning = baseAmount - platformFee;

    const booking = await Booking.create({
        user: req.user._id,
        slot: slotId,
        startTime: start,
        endTime: end,
        vehicleNumber: vehicleNumber || null,
        totalAmount: baseAmount,
        platformFee,
        ownerEarning,
        status: 'Pending',
        paymentStatus: 'Pending',
    });

    await createNotification({
        userId: slot.owner,
        category: 'booking',
        title: 'New booking request',
        message: `${req.user.name} requested ${slot.title} from ${start.toLocaleString()} to ${end.toLocaleString()}.`,
    });

    return res.status(201).json({
        success: true,
        data: booking,
    });
});

const getUserBookings = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, user context missing',
        });
    }

    const bookings = await Booking.find({ user: req.user._id })
        .populate({
            path: 'slot',
            select: 'title location description vehicleType pricing owner images',
            populate: {
                path: 'owner',
                select: 'name email phone',
            },
        })
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
    });
});

const getOwnerBookings = asyncHandler(async (req, res) => {
    if (!req.user || req.user.role !== 'owner') {
        return res.status(403).json({
            success: false,
            message: 'Only owners can access booking requests',
        });
    }

    const bookings = await Booking.find({})
        .populate('user', 'name email phone')
        .populate({
            path: 'slot',
            select: 'title location.city owner',
            match: { owner: req.user._id },
        })
        .sort({ createdAt: -1 });

    const ownerBookings = bookings.filter((booking) => booking.slot);

    return res.status(200).json({
        success: true,
        count: ownerBookings.length,
        data: ownerBookings,
    });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
    if (!req.user || req.user.role !== 'owner') {
        return res.status(403).json({
            success: false,
            message: 'Only owners can update booking status',
        });
    }

    const bookingId = req.params.id;
    const { status } = req.body || {};

    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Status must be either Approved or Rejected',
        });
    }

    const booking = await Booking.findById(bookingId).populate({
        path: 'slot',
        select: 'owner title location.city',
    });

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found',
        });
    }

    if (!booking.slot || String(booking.slot.owner) !== String(req.user._id)) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to update this booking',
        });
    }

    if (booking.status !== 'Pending') {
        return res.status(400).json({
            success: false,
            message: 'Only pending bookings can be updated',
        });
    }

    if (status === 'Approved') {
        const owner = await User.findById(req.user._id).select('pendingDues');

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: 'Owner account not found',
            });
        }

        if (owner.pendingDues >= 1000) {
            return res.status(403).json({
                success: false,
                message:
                    'Outstanding dues must be settled before approving new bookings',
            });
        }
    }

    booking.status = status;
    await booking.save();

    await createNotification({
        userId: booking.user,
        category: 'booking',
        title:
            status === 'Approved'
                ? 'Booking approved'
                : 'Booking rejected',
        message:
            status === 'Approved'
                ? `Your booking for ${booking.slot.title} was approved.`
                : `Your booking for ${booking.slot.title} was rejected.`,
    });

    return res.status(200).json({
        success: true,
        data: booking,
    });
});

const confirmManualPayment = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, user context missing',
        });
    }

    const bookingId = req.params.id || (req.body && req.body.bookingId);

    if (!bookingId) {
        return res.status(400).json({
            success: false,
            message: 'bookingId is required',
        });
    }

    const booking = await Booking.findById(bookingId).populate({
        path: 'slot',
        select: 'owner',
    });

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found',
        });
    }

    if (String(booking.user) !== String(req.user._id)) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to confirm payment for this booking',
        });
    }

    if (booking.status !== 'Approved') {
        return res.status(400).json({
            success: false,
            message: 'Only approved bookings can be marked as paid',
        });
    }

    if (booking.paymentStatus !== 'Pending') {
        return res.status(400).json({
            success: false,
            message: 'Payment is already confirmed for this booking',
        });
    }

    if (!booking.slot || !booking.slot.owner) {
        return res.status(500).json({
            success: false,
            message: 'Slot owner not found for settlement update',
        });
    }

    const owner = await User.findById(booking.slot.owner);

    if (!owner) {
        return res.status(404).json({
            success: false,
            message: 'Owner account not found',
        });
    }

    booking.paymentStatus = 'Paid';
    booking.status = 'Active';
    owner.pendingDues += booking.platformFee;

    await booking.save();
    await owner.save();

    await createNotification({
        userId: booking.slot.owner,
        category: 'payment',
        title: 'Booking payment confirmed',
        message: `Payment for booking ${booking._id} has been confirmed.`,
    });

    return res.status(200).json({
        success: true,
        data: booking,
    });
});

const checkAndApplyOverstay = asyncHandler(async (req, res) => {
    const bookingId = req.params.id || (req.body && req.body.bookingId);

    if (!bookingId) {
        return res.status(400).json({
            success: false,
            message: 'bookingId is required',
        });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found',
        });
    }

    if (booking.status !== 'Active') {
        return res.status(200).json({
            success: true,
            data: booking,
        });
    }

    const currentTime = new Date();
    const bookingEndTime = new Date(booking.endTime);

    if (currentTime <= bookingEndTime) {
        return res.status(200).json({
            success: true,
            data: booking,
        });
    }

    const graceMinutes = 30;
    const graceEndTime = new Date(
        bookingEndTime.getTime() + graceMinutes * 60 * 1000
    );

    if (currentTime <= graceEndTime) {
        return res.status(200).json({
            success: true,
            data: booking,
        });
    }

    const extraMs = currentTime - graceEndTime;
    const extraHours = Math.ceil(extraMs / (1000 * 60 * 60));

    const slot = await ParkingSlot.findById(booking.slot).select(
        'pricing.baseHourly owner'
    );

    if (!slot) {
        return res.status(404).json({
            success: false,
            message: 'Parking slot not found',
        });
    }

    const baseHourly =
        slot.pricing && slot.pricing.baseHourly ? slot.pricing.baseHourly : 0;
    const penalty = extraHours * baseHourly;
    const extraPlatformFee = penalty * 0.1;

    booking.penaltyAmount += penalty;
    booking.totalAmount += penalty;
    booking.platformFee += extraPlatformFee;
    booking.status = 'Overstayed';

    const owner = await User.findById(slot.owner);

    if (!owner) {
        return res.status(404).json({
            success: false,
            message: 'Owner account not found',
        });
    }

    owner.pendingDues += extraPlatformFee;

    await owner.save();
    await booking.save();

    return res.status(200).json({
        success: true,
        data: booking,
    });
});

module.exports = {
    createBooking,
    getUserBookings,
    getOwnerBookings,
    updateBookingStatus,
    confirmManualPayment,
    checkAndApplyOverstay,
};
