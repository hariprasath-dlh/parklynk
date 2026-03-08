const User = require('../models/User');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const asyncHandler = require('../utils/asyncHandler');

const LICENSE_REGEX = /[A-Z]{2}[0-9]{2}[A-Z0-9]{8,14}/;
const LICENSE_KEYWORDS = ['DRIVING', 'LICENCE', 'LICENSE'];

const extractLicenseNumber = (extractedText = '') => {
    const cleanedText = String(extractedText)
        .toUpperCase()
        .replace(/\s+/g, '')
        .replace(/[^A-Z0-9]/g, '');

    const match = cleanedText.match(LICENSE_REGEX);

    return {
        cleanedText,
        licenseNumber: match ? match[0] : null,
    };
};

const hasLicenseKeywords = (extractedText = '') => {
    const normalized = String(extractedText).toUpperCase();
    return LICENSE_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({
            success: false,
            message: 'Please provide name, email, password, and phone',
        });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: 'Email already registered',
        });
    }

    const user = await User.create({
        name,
        email,
        password,
        phone,
        ...(role && { role }),
    });

    const token = generateToken(user._id);

    return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified,
            licenseVerified: user.licenseVerified,
            licenseNumber: user.licenseNumber,
            licenseImage: user.licenseImage,
            token,
        },
    });
});

const loginUser = asyncHandler(async (req, res) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({
            success: false,
            message: 'Request body is missing. Ensure Content-Type is application/json and body is sent properly.',
        });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password',
        });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password',
        });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password',
        });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified,
            licenseVerified: user.licenseVerified,
            licenseNumber: user.licenseNumber,
            licenseImage: user.licenseImage,
            token,
        },
    });
});

const getUserProfile = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized',
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            role: req.user.role,
            isVerified: req.user.isVerified,
            licenseVerified: req.user.licenseVerified,
            licenseNumber: req.user.licenseNumber,
            licenseImage: req.user.licenseImage,
            isActive: req.user.isActive,
            pendingDues: req.user.pendingDues,
            settlementHistory: req.user.settlementHistory,
        },
    });
});

const deleteAccount = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized',
        });
    }

    const userId = req.user._id;

    try {
        const ownedSlots = await ParkingSlot.find({ owner: userId }).select('_id');
        const ownedSlotIds = ownedSlots.map((slot) => slot._id);

        await Promise.all([
            Booking.deleteMany({
                $or: [{ user: userId }, { slot: { $in: ownedSlotIds } }],
            }),
            ParkingSlot.deleteMany({ owner: userId }),
            Notification.deleteMany({ user: userId }),
            User.findByIdAndDelete(userId),
        ]);

        return res.status(200).json({
            success: true,
            message: 'Account deleted successfully',
        });
    } catch (error) {
        console.error('Delete account failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete account',
        });
    }
});

const verifyLicense = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized',
        });
    }

    const { imageData } = req.body || {};

    if (!imageData || typeof imageData !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'License image is required',
        });
    }

    let imageBuffer;

    try {
        const base64 = imageData.includes(',') ? imageData.split(',')[1] : imageData;
        imageBuffer = Buffer.from(base64, 'base64');
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid license image format',
        });
    }

    console.log('License verification requested for user:', String(req.user._id));

    const processedImage = await sharp(imageBuffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .grayscale()
        .normalize()
        .sharpen()
        .toBuffer();

    const { data } = await Tesseract.recognize(processedImage, 'eng', {
        logger:
            process.env.NODE_ENV === 'development'
                ? (message) => console.log('OCR:', message.status, message.progress || 0)
                : undefined,
    });

    const extractedText = String(data?.text || '');
    const { cleanedText, licenseNumber } = extractLicenseNumber(extractedText);
    const keywordMatch = hasLicenseKeywords(extractedText);
    const verificationPassed = Boolean(licenseNumber || keywordMatch);

    console.log('Raw OCR text:', extractedText);
    console.log('Normalized OCR text:', cleanedText);
    console.log('Detected DL number:', licenseNumber);
    console.log('Keyword match:', keywordMatch);

    if (!verificationPassed) {
        await User.findByIdAndUpdate(req.user._id, {
            licenseVerified: false,
            isVerified: false,
            licenseImage: imageData,
            licenseNumber: null,
        });

        return res.status(400).json({
            success: false,
            message: 'Invalid driving license document',
        });
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            licenseVerified: true,
            isVerified: true,
            licenseImage: imageData,
            licenseNumber: licenseNumber || req.user.licenseNumber || null,
        },
        { new: true }
    ).select('-password');

    return res.status(200).json({
        success: true,
        licenseNumber: updatedUser.licenseNumber,
        message: 'License verified successfully',
        data: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            isVerified: updatedUser.isVerified,
            licenseVerified: updatedUser.licenseVerified,
            licenseNumber: updatedUser.licenseNumber,
            licenseImage: updatedUser.licenseImage,
        },
    });
});

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    deleteAccount,
    verifyLicense,
};
