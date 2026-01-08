const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { logActivity } = require('./activityController');

// Get all users (for admin panel & task assignment)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password -resetToken -resetTokenExpiry')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        console.error('GET ALL USERS ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create user (admin only)
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'member'
        });

        // Log activity
        await logActivity(
            req.user.id,
            req.user.username,
            req.user.role,
            `Created user "${username}" with role "${role || 'member'}"`,
            'user',
            newUser._id,
            { email, role: role || 'member' }
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('CREATE USER ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['admin', 'manager', 'member'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const oldRole = user.role;
        user.role = role;
        await user.save();

        // Log activity
        await logActivity(
            req.user.id,
            req.user.username,
            req.user.role,
            `Updated user "${user.username}" role from "${oldRole}" to "${role}"`,
            'user',
            user._id,
            { oldRole, newRole: role }
        );

        res.json({
            message: 'User role updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('UPDATE USER ROLE ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Prevent self-deletion
        if (userId === req.user.id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(userId);

        // Log activity
        await logActivity(
            req.user.id,
            req.user.username,
            req.user.role,
            `Deleted user "${user.username}" (${user.role})`,
            'user',
            userId,
            { email: user.email, role: user.role }
        );

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('DELETE USER ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
