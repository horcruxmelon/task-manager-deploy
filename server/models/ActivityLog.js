const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        enum: ['admin', 'manager', 'member'],
        required: true
    },
    action: {
        type: String,
        required: true
    },
    targetType: {
        type: String,
        enum: ['user', 'task', 'comment', 'system'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    }
}, { timestamps: true });

// Index for efficient querying
ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ userId: 1 });
ActivityLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
