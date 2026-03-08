const ParkingSlot = require('../models/ParkingSlot');
const asyncHandler = require('../utils/asyncHandler');

const buildSlotPayload = (body = {}) => {
    const { title, description, vehicleType, location = {}, pricing = {}, images } =
        body;

    return {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(vehicleType !== undefined && { vehicleType }),
        ...(location && {
            location: {
                ...(location.address !== undefined && { address: location.address }),
                ...(location.city !== undefined && { city: location.city }),
                ...(location.latitude !== undefined && {
                    latitude: location.latitude,
                }),
                ...(location.longitude !== undefined && {
                    longitude: location.longitude,
                }),
            },
        }),
        ...(pricing && {
            pricing: {
                ...(pricing.baseHourly !== undefined && {
                    baseHourly: pricing.baseHourly,
                }),
                ...(pricing.baseDaily !== undefined && {
                    baseDaily: pricing.baseDaily,
                }),
                ...(pricing.baseMonthly !== undefined && {
                    baseMonthly: pricing.baseMonthly,
                }),
                ...(pricing.peakMultiplier !== undefined && {
                    peakMultiplier: pricing.peakMultiplier,
                }),
                ...(pricing.weekendMultiplier !== undefined && {
                    weekendMultiplier: pricing.weekendMultiplier,
                }),
            },
        }),
        ...(Array.isArray(images) && { images }),
    };
};

const validateRequiredSlotFields = (payload) => {
    return Boolean(
        payload.title &&
            payload.description &&
            payload.vehicleType &&
            payload.location &&
            payload.location.address &&
            payload.location.city &&
            payload.location.latitude !== undefined &&
            payload.location.longitude !== undefined &&
            payload.pricing &&
            payload.pricing.baseHourly !== undefined &&
            payload.pricing.baseDaily !== undefined &&
            payload.pricing.baseMonthly !== undefined
    );
};

const createSlot = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, user context missing',
        });
    }

    if (req.user.role !== 'owner') {
        return res.status(403).json({
            success: false,
            message: 'Only owners can create parking slots',
        });
    }

    const payload = buildSlotPayload(req.body);

    if (process.env.NODE_ENV === 'development') {
        console.log('createSlot req.body:', req.body);
    }

    if (!validateRequiredSlotFields(payload)) {
        return res.status(400).json({
            success: false,
            message:
                'Please provide title, description, vehicleType, location.address, location.city, location.latitude, location.longitude, pricing.baseHourly, pricing.baseDaily, and pricing.baseMonthly',
        });
    }

    const slot = await ParkingSlot.create({
        owner: req.user._id,
        ...payload,
    });

    return res.status(201).json({
        success: true,
        message: 'Parking slot created successfully',
        data: slot,
    });
});

const getAllSlots = asyncHandler(async (req, res) => {
    const { city, vehicleType, ownerId } = req.query;

    const filter = {};

    if (req.query.includeInactive !== 'true') {
        filter.isActive = true;
    }

    if (city) {
        filter['location.city'] = city;
    }

    if (vehicleType) {
        filter.vehicleType = vehicleType;
    }

    if (ownerId) {
        filter.owner = ownerId;
    }

    const slots = await ParkingSlot.find(filter)
        .populate('owner', 'name email phone')
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        count: slots.length,
        data: slots,
    });
});

const getSlotById = asyncHandler(async (req, res) => {
    const slot = await ParkingSlot.findById(req.params.id).populate(
        'owner',
        'name email phone'
    );

    if (!slot) {
        return res.status(404).json({
            success: false,
            message: 'Parking slot not found',
        });
    }

    return res.status(200).json({
        success: true,
        data: slot,
    });
});

const updateSlot = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, user context missing',
        });
    }

    const slot = await ParkingSlot.findById(req.params.id);

    if (!slot) {
        return res.status(404).json({
            success: false,
            message: 'Parking slot not found',
        });
    }

    if (
        req.user.role !== 'admin' &&
        String(slot.owner) !== String(req.user._id)
    ) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to update this slot',
        });
    }

    const payload = buildSlotPayload(req.body);

    if (payload.location) {
        slot.location = {
            ...slot.location.toObject(),
            ...payload.location,
        };
    }

    if (payload.pricing) {
        slot.pricing = {
            ...slot.pricing.toObject(),
            ...payload.pricing,
        };
    }

    ['title', 'description', 'vehicleType', 'images'].forEach((field) => {
        if (payload[field] !== undefined) {
            slot[field] = payload[field];
        }
    });

    if (req.body && req.body.isActive !== undefined) {
        slot.isActive = Boolean(req.body.isActive);
    }

    await slot.save();

    return res.status(200).json({
        success: true,
        message: 'Parking slot updated successfully',
        data: slot,
    });
});

const deleteSlot = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, user context missing',
        });
    }

    const slot = await ParkingSlot.findById(req.params.id);

    if (!slot) {
        return res.status(404).json({
            success: false,
            message: 'Parking slot not found',
        });
    }

    if (
        req.user.role !== 'admin' &&
        String(slot.owner) !== String(req.user._id)
    ) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to delete this slot',
        });
    }

    await slot.deleteOne();

    return res.status(200).json({
        success: true,
        message: 'Parking slot deleted successfully',
    });
});

module.exports = {
    createSlot,
    getAllSlots,
    getSlotById,
    updateSlot,
    deleteSlot,
};
