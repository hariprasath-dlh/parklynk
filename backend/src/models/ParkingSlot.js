const mongoose = require('mongoose');

const ParkingSlotSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        vehicleType: {
            type: String,
            enum: ['2W', '4W', 'BOTH'],
            required: true,
        },
        location: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
        },
        pricing: {
            baseHourly: { type: Number, required: true },
            baseDaily: { type: Number, required: true },
            baseMonthly: { type: Number, required: true },
            peakMultiplier: { type: Number, default: 1 },
            weekendMultiplier: { type: Number, default: 1 },
        },
        images: [
            {
                type: String,
                trim: true,
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

ParkingSlotSchema.index({ 'location.city': 1 });
ParkingSlotSchema.index({ vehicleType: 1 });

module.exports = mongoose.model('ParkingSlot', ParkingSlotSchema);
