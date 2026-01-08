const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const {
    getAllUsers,
    createUser,
    updateUserRole,
    deleteUser
} = require('../controllers/userController');

// All routes require authentication
router.use(authMiddleware);

// Get all users - Admin & Manager (Manager needs it for task assignment)
router.get('/', roleMiddleware(['admin', 'manager']), getAllUsers);

// Create user - Admin only
router.post('/', roleMiddleware(['admin']), createUser);

// Update user role - Admin only
router.put('/:userId/role', roleMiddleware(['admin']), updateUserRole);

// Delete user - Admin only
router.delete('/:userId', roleMiddleware(['admin']), deleteUser);

module.exports = router;
