const Result = require('../models/Result');
const Exam = require('../models/Exam');
const Quiz = require('../models/Quiz');

// @desc    Start an exam (creates in-progress result)
// @route   POST /api/results/start/:examId
// @access  Private (Participant)
const startExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

        // Check access
        const hasAccess =
            exam.isPublic ||
            exam.assignedParticipants.some((p) => p.toString() === req.user._id.toString()) ||
            (exam.examType === 'self_practice' && exam.createdBy.toString() === req.user._id.toString());

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: 'Not authorized to take this exam.' });
        }

        // Check for existing in-progress result
        const existingResult = await Result.findOne({
            exam: exam._id,
            participant: req.user._id,
            status: 'in_progress',
        });
        if (existingResult) {
            return res.json({ success: true, message: 'Resuming exam', result: existingResult });
        }

        // Check if already submitted
        const submittedResult = await Result.findOne({
            exam: exam._id,
            participant: req.user._id,
            status: { $in: ['submitted', 'evaluated'] },
        });
        if (submittedResult) {
            return res.status(400).json({ success: false, message: 'You have already submitted this exam.' });
        }

        const result = await Result.create({
            exam: exam._id,
            participant: req.user._id,
            totalMarks: exam.totalMarks,
            status: 'in_progress',
            startedAt: new Date(),
        });

        res.status(201).json({ success: true, message: 'Exam started', result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit exam with answers
// @route   POST /api/results/submit/:examId
// @access  Private (Participant)
const submitExam = async (req, res) => {
    try {
        const { answers } = req.body; // [{ quizId, selectedAnswer }]
        const exam = await Exam.findById(req.params.examId).populate('quizzes');

        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

        let result = await Result.findOne({
            exam: exam._id,
            participant: req.user._id,
            status: 'in_progress',
        });

        if (!result) {
            return res.status(400).json({ success: false, message: 'No active exam session found. Please start the exam first.' });
        }

        // Evaluate answers
        let obtainedMarks = 0;
        const evaluatedAnswers = exam.quizzes.map((quiz) => {
            const userAnswer = answers.find((a) => a.quizId === quiz._id.toString());
            const selectedAnswer = userAnswer ? userAnswer.selectedAnswer : '';
            const isCorrect = selectedAnswer === quiz.correctAnswer;
            const marksAwarded = isCorrect ? quiz.marks : 0;
            obtainedMarks += marksAwarded;

            return { quiz: quiz._id, selectedAnswer, isCorrect, marksAwarded };
        });

        const timeTaken = Math.round((new Date() - result.startedAt) / 1000);

        result.answers = evaluatedAnswers;
        result.obtainedMarks = obtainedMarks;
        result.totalMarks = exam.totalMarks;
        result.timeTaken = timeTaken;
        result.submittedAt = new Date();
        result.status = 'evaluated';
        await result.save();

        res.json({
            success: true,
            message: 'Exam submitted and evaluated!',
            result: {
                _id: result._id,
                obtainedMarks,
                totalMarks: exam.totalMarks,
                percentage: result.percentage,
                grade: result.grade,
                timeTaken,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get result details
// @route   GET /api/results/:id
// @access  Private
const getResult = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id)
            .populate('participant', 'name email')
            .populate({
                path: 'exam',
                populate: { path: 'quizzes', select: 'subject topic question options correctAnswer category marks' },
            })
            .populate('answers.quiz', 'subject topic question options correctAnswer marks');

        if (!result) return res.status(404).json({ success: false, message: 'Result not found.' });

        // Only the participant or admin/setter can view
        if (
            req.user.role === 'participant' &&
            result.participant._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get my results
// @route   GET /api/results/my
// @access  Private (Participant)
const getMyResults = async (req, res) => {
    try {
        const results = await Result.find({ participant: req.user._id, status: { $in: ['submitted', 'evaluated'] } })
            .populate('exam', 'title category duration totalMarks')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: results.length, results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get results for an exam (Setter/Admin)
// @route   GET /api/results/exam/:examId
// @access  Private (Setter, Admin)
const getExamResults = async (req, res) => {
    try {
        const results = await Result.find({
            exam: req.params.examId,
            status: { $in: ['submitted', 'evaluated'] },
        })
            .populate('participant', 'name email')
            .sort({ obtainedMarks: -1 });

        res.json({ success: true, count: results.length, results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get overall stats for admin dashboard
// @route   GET /api/results/stats/overview
// @access  Private (Admin)
const getOverviewStats = async (req, res) => {
    try {
        const User = require('../models/User');
        const Quiz = require('../models/Quiz');
        const totalUsers = await User.countDocuments({ isActive: true });
        const totalQuizzes = await Quiz.countDocuments({ isActive: true });
        const totalExams = await Exam.countDocuments();
        const totalResults = await Result.countDocuments({ status: 'evaluated' });

        const avgStats = await Result.aggregate([
            { $match: { status: 'evaluated' } },
            { $group: { _id: null, avgPercentage: { $avg: '$percentage' }, avgMarks: { $avg: '$obtainedMarks' } } },
        ]);

        const gradeDistribution = await Result.aggregate([
            { $match: { status: 'evaluated' } },
            { $group: { _id: '$grade', count: { $sum: 1 } } },
        ]);

        res.json({
            success: true,
            stats: {
                totalUsers, totalQuizzes, totalExams, totalResults,
                avgPercentage: avgStats[0]?.avgPercentage?.toFixed(1) || 0,
                gradeDistribution,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { startExam, submitExam, getResult, getMyResults, getExamResults, getOverviewStats };