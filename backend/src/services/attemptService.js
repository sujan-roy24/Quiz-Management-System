const Attempt = require('../models/Attempt');
const Exam = require('../models/Exam');

const submitAttempt = async (userId, examId, answers) => {
    if (await Attempt.findOne({ user: userId, exam: examId }))
        throw new Error('Already attempted this exam');

    const exam = await Exam.findById(examId).populate('selectedQuizIds');
    if (!exam) throw new Error('Exam not found');

    if (!exam.allowedParticipants.map(p => p.toString()).includes(userId))
        throw new Error('You are not allowed to take this exam');

    const now = new Date();
    const end = new Date(exam.startDateTime.getTime() + exam.durationMinutes * 60000);
    if (now < exam.startDateTime) throw new Error('Exam has not started yet');
    if (now > end) throw new Error('Exam time expired');

    const score = answers.reduce((acc, ans) => {
        const quiz = exam.selectedQuizIds.find(q => q._id.toString() === ans.quizId);
        return acc + (quiz?.correctAnswer === ans.selectedOption ? 1 : 0);
    }, 0);

    return Attempt.create({ user: userId, exam: examId, answers, score });
};

const getUserAttempts = (userId) =>
    Attempt.find({ user: userId }).populate('exam', 'title');

module.exports = { submitAttempt, getUserAttempts };