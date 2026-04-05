const { verifyToken } = require('../utils/jwtHelper');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    try {
        req.user = verifyToken(token);
        next();
    } catch {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = authMiddleware;