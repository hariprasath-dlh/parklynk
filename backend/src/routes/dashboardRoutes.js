const express = require('express');
const { getOwnerDashboard } = require('../controllers/dashboardController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/owner', protect, authorizeRoles('owner'), getOwnerDashboard);

module.exports = router;
