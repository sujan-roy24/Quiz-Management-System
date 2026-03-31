const Quiz = require('../models/Quiz');

// @desc    Get all quizzes (with filters)
// @route   GET /api/quizzes
// @access  Private
const getQuizzes = async (req, res) => {
    try {
        const { category, subject, topic, page = 1, limit = 20, search } = req.query;
        const filter = { isActive: true };

        if (category && category !== 'all') filter.category = category;
        if (subject) filter.subject = new RegExp(subject, 'i');
        if (topic) filter.topic = new RegExp(topic, 'i');
        if (search) {
            filter.$or = [
                { question: new RegExp(search, 'i') },
                { subject: new RegExp(search, 'i') },
                { topic: new RegExp(search, 'i') },
            ];
        }

        const total = await Quiz.countDocuments(filter);
        const quizzes = await Quiz.find(filter)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({
            success: true,
            count: quizzes.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            quizzes,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Private
const getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name email');
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });
        res.json({ success: true, quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create quiz
// @route   POST /api/quizzes
// @access  Private (Admin only)
const createQuiz = async (req, res) => {
    try {
        const { subject, topic, question, options, correctAnswer, category, marks, tags } = req.body;

        const quiz = await Quiz.create({
            subject, topic, question, options, correctAnswer, category,
            marks: marks || 1,
            tags: tags || [],
            createdBy: req.user._id,
        });

        res.status(201).json({ success: true, message: 'Quiz created successfully', quiz });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Admin only)
const updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true,
        });
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });
        res.json({ success: true, message: 'Quiz updated successfully', quiz });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete quiz (soft delete)
// @route   DELETE /api/quizzes/:id
// @access  Private (Admin only)
const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });
        res.json({ success: true, message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get quiz stats (subjects, topics, counts)
// @route   GET /api/quizzes/stats
// @access  Private
const getQuizStats = async (req, res) => {
    try {
        const stats = await Quiz.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    subjects: { $addToSet: '$subject' },
                },
            },
        ]);
        const total = await Quiz.countDocuments({ isActive: true });
        res.json({ success: true, stats, total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getQuizzes, getQuiz, createQuiz, updateQuiz, deleteQuiz, getQuizStats };