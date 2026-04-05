const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/passwordHelper');
const { generateToken } = require('../utils/jwtHelper');

const formatUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role });

const register = async (name, email, password, role) => {
    if (await User.findOne({ email })) throw new Error('Email already exists');
    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash, role });
    return { token: generateToken(user._id, user.role), user: formatUser(user) };
};

const login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user || !(await comparePassword(password, user.passwordHash)))
        throw new Error('Invalid credentials');
    return { token: generateToken(user._id, user.role), user: formatUser(user) };
};

module.exports = { register, login };