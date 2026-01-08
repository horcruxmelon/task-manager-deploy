const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Access is denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user to get role and other info
        const user = await User.findById(decoded.id).select('-password -resetToken -resetTokenExpiry');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};