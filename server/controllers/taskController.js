const Task = require('../models/Task');
const { logActivity } = require('./activityController');
const User = require('../models/User');

// Get all tasks
// Admin/Manager: All tasks
// Member: Only tasks assigned to them or created by them
exports.getAllTasks = async (req, res) => {
    try {
        let query = {};

        // If member, only show assigned tasks
        if (req.user.role === 'member') {
            query = { assignedTo: req.user.id };
        }
        // Admin/Manager see all tasks by default

        const tasks = await Task.find(query)
            .populate('assignedTo', 'username email')
            .populate('assignedBy', 'username email')
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        console.error('GET ALL TASKS ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single task
exports.getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'username email')
            .populate('assignedBy', 'username email')
            .populate('comments.userId', 'username');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check access permission
        if (req.user.role === 'member' && task.assignedTo?._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(task);
    } catch (error) {
        console.error('GET TASK ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create task - Admin & Manager only
exports.createTask = async (req, res) => {
    try {
        if (['member'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Only Managers and Admins can create tasks' });
        }

        const { title, description, status, dueDate, assignedTo } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const task = await Task.create({
            title,
            description: description || '',
            status: status || 'pending',
            dueDate: dueDate || null,
            userId: req.user.id, // Creator
            assignedBy: req.user.id,
            assignedTo: assignedTo || null
        });

        // Log activity
        await logActivity(
            req.user.id,
            req.user.username,
            req.user.role,
            `Created task "${title}"`,
            'task',
            task._id,
            { assignedTo }
        );

        res.status(201).json(task);
    } catch (error) {
        console.error('CREATE TASK ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update task
// Member: Can only update status
// Admin/Manager: Can update everything
exports.updateTask = async (req, res) => {
    try {
        const { title, description, status, dueDate, assignedTo } = req.body;
        const taskId = req.params.id;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Permission check
        if (req.user.role === 'member') {
            if (task.assignedTo?.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }
            // Members can only update status
            const changes = {};
            if (status && status !== task.status) {
                changes.oldStatus = task.status;
                changes.newStatus = status;
                task.status = status;
            }

            if (Object.keys(changes).length > 0) {
                await task.save();
                await logActivity(
                    req.user.id,
                    req.user.username,
                    req.user.role,
                    `Updated task status to "${status}"`,
                    'task',
                    task._id,
                    changes
                );
            }
            return res.json(task);
        }

        // Admin/Manager updates
        if (['admin', 'manager'].includes(req.user.role)) {
            const changes = {};

            if (title !== undefined && title !== task.title) {
                changes.title = { old: task.title, new: title };
                task.title = title;
            }
            if (description !== undefined) task.description = description;
            if (status !== undefined && status !== task.status) {
                changes.status = { old: task.status, new: status };
                task.status = status;
            }
            if (dueDate !== undefined) task.dueDate = dueDate;
            if (assignedTo !== undefined && assignedTo !== task.assignedTo?.toString()) {
                changes.assignedTo = { old: task.assignedTo, new: assignedTo };
                task.assignedTo = assignedTo;
            }

            await task.save();

            if (Object.keys(changes).length > 0) {
                await logActivity(
                    req.user.id,
                    req.user.username,
                    req.user.role,
                    `Updated task "${task.title}"`,
                    'task',
                    task._id,
                    changes
                );
            }

            return res.json(task);
        }

    } catch (error) {
        console.error('UPDATE TASK ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete task - Admin & Manager only
exports.deleteTask = async (req, res) => {
    try {
        if (['member'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await logActivity(
            req.user.id,
            req.user.username,
            req.user.role,
            `Deleted task "${task.title}"`,
            'task',
            req.params.id,
            { title: task.title }
        );

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('DELETE TASK ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add comment
exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Check if user has access to this task
        if (req.user.role === 'member' && task.assignedTo?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const comment = {
            userId: req.user.id,
            username: req.user.username,
            text,
            timestamp: new Date()
        };

        task.comments.push(comment);
        await task.save();

        await logActivity(
            req.user.id,
            req.user.username,
            req.user.role,
            `Added comment on task "${task.title}"`,
            'comment',
            task._id,
            { text }
        );

        res.json(task);
    } catch (error) {
        console.error('ADD COMMENT ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
