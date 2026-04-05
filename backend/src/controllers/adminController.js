const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Exam = require('../models/Exam');
const Attempt = require('../models/Attempt');
const { hashPassword } = require('../utils/passwordHelper');
const { withStatus } = require('../services/examService');
// const { parse } = require('csv-parse/sync');
const { parse } = require('csv-parse');

// GET /admin/stats
const getStats = async (req, res) => {
    try {
        const [
            totalUsers, superadminCount, adminCount, setterCount, participantCount,
            totalQuizzes, basicCount, intermediateCount, advancedCount,
            totalExams, attempts
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'superadmin' }),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({ role: 'setter' }),
            User.countDocuments({ role: 'participant' }),
            Quiz.countDocuments(),
            Quiz.countDocuments({ label: 'basic' }),
            Quiz.countDocuments({ label: 'intermediate' }),
            Quiz.countDocuments({ label: 'advanced' }),
            Exam.find().select('startDateTime durationMinutes'),
            Attempt.countDocuments()
        ]);

        const examStatuses = totalExams.map(e => withStatus(e).status);

        res.json({
            success: true, data: {
                users: { total: totalUsers, superadmin: superadminCount, admin: adminCount, setter: setterCount, participant: participantCount },
                quizzes: { total: totalQuizzes, basic: basicCount, intermediate: intermediateCount, advanced: advancedCount },
                exams: {
                    total: totalExams.length,
                    upcoming: examStatuses.filter(s => s === 'upcoming').length,
                    ongoing: examStatuses.filter(s => s === 'ongoing').length,
                    completed: examStatuses.filter(s => s === 'completed').length
                },
                attempts
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /admin/users
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /admin/users
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role)
            return res.status(400).json({ success: false, message: 'All fields required' });
        if (await User.findOne({ email }))
            return res.status(400).json({ success: false, message: 'Email already exists' });
        const passwordHash = await hashPassword(password);
        const user = await User.create({ name, email, passwordHash, role });
        res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// PUT /admin/users/:id/role
const changeRole = async (req, res) => {
    try {
        const { role } = req.body;
        const target = await User.findById(req.params.id);
        if (!target) return res.status(404).json({ success: false, message: 'User not found' });
        if (target.role === 'superadmin')
            return res.status(403).json({ success: false, message: 'Cannot change superadmin role' });
        if (target._id.toString() === req.user.userId)
            return res.status(403).json({ success: false, message: 'Cannot change your own role' });
        // Only superadmin can assign/change admin role
        if ((role === 'admin' || target.role === 'admin') && req.user.role !== 'superadmin')
            return res.status(403).json({ success: false, message: 'Only superadmin can manage admin roles' });
        target.role = role;
        await target.save();
        res.json({ success: true, data: target });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// DELETE /admin/users/:id (superadmin only)
const deleteUser = async (req, res) => {
    try {
        const target = await User.findById(req.params.id);
        if (!target) return res.status(404).json({ success: false, message: 'User not found' });
        if (target.role === 'superadmin')
            return res.status(403).json({ success: false, message: 'Cannot delete superadmin' });
        if (target._id.toString() === req.user.userId)
            return res.status(403).json({ success: false, message: 'Cannot delete yourself' });
        await target.deleteOne();
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getParticipants = async (req, res) => {
    try {
        const users = await User.find({ role: 'participant' }).select('_id name email');
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
const uploadQuizCSV = async (req, res) => {
    try {
        if (!req.body.csv)
            return res.status(400).json({ success: false, message: 'No CSV data' });

        // Parse async using promise wrapper
        const records = await new Promise((resolve, reject) => {
            parse(req.body.csv, { columns: true, skip_empty_lines: true, trim: true },
                (err, data) => err ? reject(err) : resolve(data)
            );
        });

        const errors = [];
        const quizzes = [];

        records.forEach((r, i) => {
            const row = i + 2;
            if (!r.subject || !r.question || !r.correct || !r.option1 || !r.option2)
                return errors.push(`Row ${row}: missing required fields`);
            if (!['basic', 'intermediate', 'advanced'].includes(r.label))
                return errors.push(`Row ${row}: label must be basic, intermediate, or advanced`);
            quizzes.push({
                subjectName: r.subject,
                topicName: r.topic,
                questionText: r.question,
                options: [r.option1, r.option2, r.option3, r.option4].filter(Boolean),
                correctAnswer: r.correct,
                label: r.label
            });
        });

        if (errors.length)
            return res.status(400).json({ success: false, message: errors.join(' | ') });

        const result = await Quiz.insertMany(quizzes);
        res.json({ success: true, message: `${result.length} quizzes imported successfully` });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
module.exports = { getStats, getUsers, createUser, changeRole, deleteUser, getParticipants, uploadQuizCSV };