const jwt = require('jsonwebtoken');

const generateToken = (userId, role) =>
    jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const verifyToken = (token) =>
    jwt.verify(token, process.env.JWT_SECRET);

module.exports = { generateToken, verifyToken };