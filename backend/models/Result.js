const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    selectedAnswer: { type: String, default: '' },
    isCorrect: { type: Boolean, default: false },
    marksAwarded: { type: Number, default: 0 },
});

const resultSchema = new mongoose.Schema(
    {
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam',
            required: true,
        },
        participant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        answers: [answerSchema],
        totalMarks: { type: Number, default: 0 },
        obtainedMarks: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
        grade: {
            type: String,
            enum: ['A+', 'A', 'B', 'C', 'D', 'F'],
            default: 'F',
        },
        status: {
            type: String,
            enum: ['in_progress', 'submitted', 'evaluated'],
            default: 'in_progress',
        },
        startedAt: { type: Date, default: Date.now },
        submittedAt: { type: Date },
        timeTaken: { type: Number, default: 0 }, // in seconds
    },
    { timestamps: true }
);

// Auto-calculate grade based on percentage
resultSchema.pre('save', function (next) {
    if (this.totalMarks > 0) {
        this.percentage = Math.round((this.obtainedMarks / this.totalMarks) * 100);
    }
    if (this.percentage >= 90) this.grade = 'A+';
    else if (this.percentage >= 80) this.grade = 'A';
    else if (this.percentage >= 70) this.grade = 'B';
    else if (this.percentage >= 60) this.grade = 'C';
    else if (this.percentage >= 50) this.grade = 'D';
    else this.grade = 'F';
    next();
});

module.exports = mongoose.model('Result', resultSchema);