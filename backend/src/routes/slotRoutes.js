const express = require('express');
const {
    createSlot,
    getAllSlots,
    getSlotById,
    updateSlot,
    deleteSlot,
} = require('../controllers/slotController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getAllSlots);
router.post('/', protect, authorizeRoles('owner'), createSlot);
router.get('/:id', getSlotById);
router.put('/:id', protect, authorizeRoles('owner', 'admin'), updateSlot);
router.delete('/:id', protect, authorizeRoles('owner', 'admin'), deleteSlot);

module.exports = router;
