const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const paySettlement = asyncHandler(async (req, res) => {
    if (!req.user || req.user.role !== 'owner') {
        return res.status(403).json({
            success: false,
            message: 'Only owners can pay settlements',
        });
    }

    const { amount } = req.body || {};

    if (amount === undefined || amount === null || Number(amount) <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Settlement amount must be greater than 0',
        });
    }

    const numericAmount = Number(amount);
    const owner = await User.findById(req.user._id);

    if (!owner) {
        return res.status(404).json({
            success: false,
            message: 'Owner account not found',
        });
    }

    if (numericAmount > owner.pendingDues) {
        return res.status(400).json({
            success: false,
            message: 'Settlement amount cannot exceed pending dues',
        });
    }

    owner.pendingDues -= numericAmount;
    owner.settlementHistory.push({
        amount: numericAmount,
        paidAt: new Date(),
    });

    await owner.save();

    return res.status(200).json({
        success: true,
        pendingDues: owner.pendingDues,
    });
});

module.exports = { paySettlement };
