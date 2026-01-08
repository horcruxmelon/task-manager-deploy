const ActivityLog = require('../models/ActivityLog');

// Helper function to log activities
exports.logActivity = async (userId, username, userRole, action, targetType, targetId, details) => {
    try {
        await ActivityLog.create({
            userId,
            username,
            userRole,
            action,
            targetType,
            targetId,
            details
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw error - logging shouldn't break the main operation
    }
};

// Get all activity logs (admin & manager only)
exports.getActivityLogs = async (req, res) => {
    try {
        const { limit = 50, skip = 0, targetType, userId } = req.query;

        const filter = {};
        if (targetType) filter.targetType = targetType;
        if (userId) filter.userId = userId;

        const logs = await ActivityLog.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .populate('userId', 'username email role');

        const total = await ActivityLog.countDocuments(filter);

        res.json({
            logs,
            total,
            hasMore: skip + logs.length < total
        });
    } catch (error) {
        console.error('GET ACTIVITY LOGS ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get recent activity for dashboard
exports.getRecentActivity = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const logs = await ActivityLog.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('action username userRole details createdAt');

        res.json(logs);
    } catch (error) {
        console.error('GET RECENT ACTIVITY ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
