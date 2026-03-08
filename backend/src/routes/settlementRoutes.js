const express = require('express');
const { paySettlement } = require('../controllers/settlementController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/pay', protect, authorizeRoles('owner'), paySettlement);

module.exports = router;
