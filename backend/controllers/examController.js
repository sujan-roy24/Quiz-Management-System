const Exam = require('../models/Exam');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

// @desc    Get all exams (role-filtered)
// @route   GET /api/exams
// @access  Private
const getExams = async (req, res) => {
    try {
        let filter = {};
        const { role, _id: userId } = req.user;

        if (role === 'setter') {
            filter.createdBy = userId;
        } else if (role === 'participant') {
            filter.$or = [
                { assignedParticipants: userId },
                { isPublic: true },
                { createdBy: userId, examType: 'self_practice' },
            ];
        }
        // Admin sees all

        const exams = await Exam.find(filter)
            .populate('createdBy', 'name email role')
            .populate('quizzes', 'subject topic category marks')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: exams.length, exams });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single exam (with quizzes, answers hidden)
// @route   GET /api/exams/:id
// @access  Private
const getExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('assignedParticipants', 'name email')
            .populate({
                path: 'quizzes',
                select: req.user.role === 'participant' ? '-correctAnswer' : '',
            });

        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

        // Check access for participants
        if (req.user.role === 'participant') {
            const hasAccess =
                exam.isPublic ||
                exam.assignedParticipants.some((p) => p._id.toString() === req.user._id.toString()) ||
                (exam.examType === 'self_practice' && exam.createdBy._id.toString() === req.user._id.toString());

            if (!hasAccess) {
                return res.status(403).json({ success: false, message: 'Access denied to this exam.' });
            }
        }

        res.json({ success: true, exam });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create exam manually (Setter selects specific quizzes)
// @route   POST /api/exams/manual
// @access  Private (Setter, Admin)
const createManualExam = async (req, res) => {
    try {
        const { title, description, quizIds, assignedParticipants, isPublic, duration, startTime, endTime, category } = req.body;

        if (!quizIds || quizIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Please select at least one quiz.' });
        }

        const quizzes = await Quiz.find({ _id: { $in: quizIds }, isActive: true });
        if (quizzes.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid quizzes found.' });
        }

        const totalMarks = quizzes.reduce((sum, q) => sum + q.marks, 0);

        const exam = await Exam.create({
            title, description,
            quizzes: quizzes.map((q) => q._id),
            createdBy: req.user._id,
            creationType: 'manual',
            examType: 'setter_created',
            assignedParticipants: assignedParticipants || [],
            isPublic: isPublic || false,
            totalMarks,
            duration: duration || 30,
            startTime, endTime,
            category: category || 'mixed',
            status: 'active',
        });

        const populated = await exam.populate('quizzes', 'subject topic category marks');
        res.status(201).json({ success: true, message: 'Exam created successfully', exam: populated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Create exam dynamically (auto-select quizzes by criteria)
// @route   POST /api/exams/dynamic
// @access  Private (Setter, Admin, Participant[basic only])
const createDynamicExam = async (req, res) => {
    try {
        const { title, description, category, numberOfQuestions, subject, assignedParticipants, isPublic, duration, startTime, endTime } = req.body;

        // Participants can only create basic self-practice exams
        if (req.user.role === 'participant') {
            if (category && category !== 'basic') {
                return res.status(403).json({ success: false, message: 'Participants can only generate Basic level exams.' });
            }
        }

        const filter = { isActive: true };
        if (category && category !== 'mixed') filter.category = category;
        if (subject) filter.subject = new RegExp(subject, 'i');

        const count = await Quiz.countDocuments(filter);
        const numQ = Math.min(numberOfQuestions || 10, count);
        if (count === 0) {
            return res.status(400).json({ success: false, message: 'No quizzes found matching the criteria.' });
        }

        // Random selection
        const allQuizIds = await Quiz.find(filter).select('_id marks');
        const shuffled = allQuizIds.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, numQ);
        const totalMarks = selected.reduce((sum, q) => sum + q.marks, 0);

        const examData = {
            title: title || `Dynamic ${category || 'Mixed'} Exam`,
            description,
            quizzes: selected.map((q) => q._id),
            createdBy: req.user._id,
            creationType: 'dynamic',
            dynamicCriteria: { category: category || 'mixed', numberOfQuestions: numQ, subject: subject || '' },
            totalMarks,
            duration: duration || 30,
            category: category || 'mixed',
            status: 'active',
        };

        if (req.user.role === 'participant') {
            examData.examType = 'self_practice';
            examData.isPublic = isPublic || false;
            examData.assignedParticipants = [];
        } else {
            examData.examType = 'setter_created';
            examData.assignedParticipants = assignedParticipants || [];
            examData.isPublic = isPublic || false;
            examData.startTime = startTime;
            examData.endTime = endTime;
        }

        const exam = await Exam.create(examData);
        const populated = await exam.populate('quizzes', 'subject topic category marks');
        res.status(201).json({ success: true, message: 'Dynamic exam generated successfully', exam: populated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private (Setter who created it, Admin)
const updateExam = async (req, res) => {
    try {
        let exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

        if (req.user.role === 'setter' && exam.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this exam.' });
        }

        exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('quizzes', 'subject topic category marks');

        res.json({ success: true, message: 'Exam updated successfully', exam });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private (Setter who created it, Admin)
const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

        if (req.user.role === 'setter' && exam.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this exam.' });
        }

        await Exam.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Assign participants to exam
// @route   PUT /api/exams/:id/assign
// @access  Private (Setter, Admin)
const assignParticipants = async (req, res) => {
    try {
        const { participantIds } = req.body;
        const exam = await Exam.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { assignedParticipants: { $each: participantIds } } },
            { new: true }
        ).populate('assignedParticipants', 'name email');

        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });
        res.json({ success: true, message: 'Participants assigned', exam });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getExams, getExam, createManualExam, createDynamicExam, updateExam, deleteExam, assignParticipants };