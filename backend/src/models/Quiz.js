const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    subjectName: { type: String, required: true },
    topicName: { type: String, required: true },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    label: { type: String, enum: ['basic', 'intermediate', 'advanced'], required: true }
});

quizSchema.index({ subjectName: 1, topicName: 1, label: 1 });

module.exports = mongoose.model('Quiz', quizSchema);