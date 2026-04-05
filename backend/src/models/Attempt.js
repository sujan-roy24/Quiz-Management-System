const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    answers: [{
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        selectedOption: String
    }],
    score: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now }
});

attemptSchema.index({ user: 1, exam: 1 }, { unique: true });

module.exports = mongoose.model('Attempt', attemptSchema);