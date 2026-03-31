const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
    try {
        const { role, page = 1, limit = 20, search } = req.query;
        const filter = {};
        if (role && role !== 'all') filter.role = role;
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
            ];
        }

        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({ success: true, count: users.length, total, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create user (Admin can create any role)
// @route   POST /api/users
// @access  Private (Admin)
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }
        const user = await User.create({ name, email, password, role });
        res.status(201).json({ success: true, message: 'User created', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
    try {
        const { name, role, isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id, { name, role, isActive }, { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, message: 'User updated', user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, message: 'User deactivated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all participants (for setter to assign)
// @route   GET /api/users/participants
// @access  Private (Setter, Admin)
const getParticipants = async (req, res) => {
    try {
        const participants = await User.find({ role: 'participant', isActive: true }).select('name email');
        res.json({ success: true, participants });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getUsers, createUser, updateUser, deleteUser, getParticipants };