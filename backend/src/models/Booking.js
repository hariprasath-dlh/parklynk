const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        slot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ParkingSlot',
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        vehicleNumber: {
            type: String,
            trim: true,
            default: null,
        },
        totalAmount: {
            type: Number,
            default: 0,
        },
        platformFee: {
            type: Number,
            default: 0,
        },
        ownerEarning: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: [
                'Pending',
                'Approved',
                'Rejected',
                'Active',
                'Completed',
                'Overstayed',
                'Cancelled',
            ],
            default: 'Pending',
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Paid', 'Refunded'],
            default: 'Pending',
        },
        penaltyAmount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

BookingSchema.index({ slot: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
