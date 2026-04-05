const Exam = require('../models/Exam');
const Attempt = require('../models/Attempt');
const { getRandomQuizzes } = require('../utils/randomSelector');

// Compute status from dates — no stored status field needed
const computeStatus = (exam) => {
    const now = new Date();
    const end = new Date(exam.startDateTime.getTime() + exam.durationMinutes * 60000);
    if (now < exam.startDateTime) return 'upcoming';
    if (now > end) return 'completed';
    return 'ongoing';
};

const withStatus = (exam) => ({
    ...exam.toObject(),
    status: computeStatus(exam),
    endDateTime: new Date(exam.startDateTime.getTime() + exam.durationMinutes * 60000)
});

const createExam = async (examData) => {
    const { quizSelectionType, dynamicCriteria, selectedQuizIds } = examData;

    if (quizSelectionType === 'dynamic') {
        if (!dynamicCriteria?.count) throw new Error('Dynamic criteria with count required');
        const quizzes = await getRandomQuizzes(dynamicCriteria, dynamicCriteria.count);
        examData.selectedQuizIds = quizzes.map(q => q._id);
    } else {
        if (!selectedQuizIds?.length) throw new Error('Manual selection requires selectedQuizIds');
    }

    return Exam.create(examData);
};

const allowParticipant = async (examId, userId, requesterId) => {
    const exam = await Exam.findById(examId);
    if (!exam) throw new Error('Exam not found');
    if (exam.createdBy.toString() !== requesterId) throw new Error('Not authorized');

    if (!exam.allowedParticipants.includes(userId)) {
        exam.allowedParticipants.push(userId);
        await exam.save();
    }
    return exam;
};

const getAvailableExams = async (userId) => {
    const now = new Date();
    const attempts = await Attempt.find({ user: userId }).select('exam');
    const attemptedIds = attempts.map(a => a.exam.toString());

    const exams = await Exam.find({
        allowedParticipants: userId,
        startDateTime: { $lte: now },
        _id: { $nin: attemptedIds }
    }).populate('createdBy', 'name');

    return exams
        .filter(e => now <= new Date(e.startDateTime.getTime() + e.durationMinutes * 60000))
        .map(withStatus);
};

const getExamResults = async (examId) => {
    const attempts = await Attempt.find({ exam: examId })
        .populate('user', 'name email')
        .sort({ score: -1 });

    return attempts.map((a, i) => ({
        rank: i + 1,
        userId: a.user._id,
        name: a.user.name,
        email: a.user.email,
        score: a.score,
        submittedAt: a.submittedAt
    }));
};

const getMyExams = (userId) => Exam.find({ createdBy: userId });

const updateExam = async (examId, userId, data) => {
    const exam = await Exam.findById(examId);
    if (!exam) throw new Error('Exam not found');
    if (exam.createdBy.toString() !== userId) throw new Error('Not authorized');
    Object.assign(exam, data);
    return exam.save();
};

const getUpcomingExams = async (userId) => {
    const now = new Date();
    const exams = await Exam.find({
        allowedParticipants: userId,
        startDateTime: { $gt: now }
    }).populate('createdBy', 'name');
    return exams.map(withStatus);
};


module.exports = { createExam, allowParticipant, getAvailableExams, getExamResults, withStatus, getMyExams, updateExam, getUpcomingExams };