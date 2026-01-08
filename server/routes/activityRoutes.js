const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const {
    getActivityLogs,
    getRecentActivity
} = require('../controllers/activityController');

// All routes require authentication
router.use(authMiddleware);

// Activity logs are visible to Admin and Manager
router.use(roleMiddleware(['admin', 'manager']));

router.get('/', getActivityLogs);
router.get('/recent', getRecentActivity);

module.exports = router;
