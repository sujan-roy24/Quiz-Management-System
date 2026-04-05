const authService = require('../services/authService');

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role)
            return res.status(400).json({ success: false, message: 'All fields required' });
        if (!['setter', 'participant'].includes(role))
            return res.status(400).json({ success: false, message: 'Invalid role' });
        if (password.length < 6)
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

        const result = await authService.register(name, email, password, role);
        res.status(201).json({ success: true, message: 'Account created! Please sign in.', user: result.user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'All fields required' });

        const result = await authService.login(email, password);
        res.status(200).json({ success: true, ...result });
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
};

module.exports = { register, login };