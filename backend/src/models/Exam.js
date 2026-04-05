const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizSelectionType: { type: String, enum: ['manual', 'dynamic'], required: true },
    selectedQuizIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
    dynamicCriteria: {
        subject: String,
        topic: String,
        label: String,
        count: Number
    },
    startDateTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    allowedParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['scheduled', 'ongoing', 'closed'], default: 'scheduled' }
});

examSchema.index({ allowedParticipants: 1, startDateTime: 1 });

module.exports = mongoose.model('Exam', examSchema);