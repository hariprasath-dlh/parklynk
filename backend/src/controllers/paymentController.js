const crypto = require('crypto');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const markBookingPaid = async (booking) => {
    const slot = await ParkingSlot.findById(booking.slot).select('owner');

    if (!slot || !slot.owner) {
        const error = new Error('Slot owner not found for settlement update');
        error.statusCode = 500;
        throw error;
    }

    const owner = await User.findById(slot.owner);

    if (!owner) {
        const error = new Error('Owner account not found');
        error.statusCode = 404;
        throw error;
    }

    booking.paymentStatus = 'Paid';
    booking.status = 'Active';
    owner.pendingDues += booking.platformFee;

    await booking.save();
    await owner.save();
};

const createPaymentOrder = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, user context missing',
        });
    }

    const { bookingId } = req.body || {};

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

    if (String(booking.user) !== String(req.user._id)) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to pay for this booking',
        });
    }

    if (booking.status !== 'Approved') {
        return res.status(400).json({
            success: false,
            message: 'Only approved bookings can be paid',
        });
    }

    if (booking.paymentStatus !== 'Pending') {
        return res.status(400).json({
            success: false,
            message: 'Payment is already completed for this booking',
        });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || process.env.JWT_SECRET;
    const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    const order = {
        id: orderId,
        amount: Math.round(Number(booking.totalAmount || 0) * 100),
        currency: 'INR',
        receipt: String(booking._id),
    };

    const simulatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${order.id}|simulated_payment_${booking._id}`)
        .digest('hex');

    return res.status(200).json({
        success: true,
        order,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
        simulated: !process.env.RAZORPAY_KEY_ID,
        simulatedVerifyPayload: {
            bookingId: booking._id,
            razorpay_order_id: order.id,
            razorpay_payment_id: `simulated_payment_${booking._id}`,
            razorpay_signature: simulatedSignature,
        },
    });
});

const verifyPayment = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, user context missing',
        });
    }

    const {
        bookingId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    } = req.body || {};

    if (
        !bookingId ||
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
    ) {
        return res.status(400).json({
            success: false,
            message:
                'bookingId, razorpay_order_id, razorpay_payment_id, and razorpay_signature are required',
        });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found',
        });
    }

    if (String(booking.user) !== String(req.user._id)) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to verify this payment',
        });
    }

    if (booking.status !== 'Approved' || booking.paymentStatus !== 'Pending') {
        return res.status(400).json({
            success: false,
            message: 'Booking is not eligible for payment verification',
        });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || process.env.JWT_SECRET;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
            success: false,
            message: 'Payment verification failed',
        });
    }

    await markBookingPaid(booking);

    return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: booking,
    });
});

module.exports = { createPaymentOrder, verifyPayment };
