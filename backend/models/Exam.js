const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Exam title is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        quizzes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Quiz',
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Type: 'manual' = setter manually chose, 'dynamic' = auto-generated
        creationType: {
            type: String,
            enum: ['manual', 'dynamic'],
            required: true,
        },
        // 'setter_created' = setter for participants | 'self_practice' = participant for themselves
        examType: {
            type: String,
            enum: ['setter_created', 'self_practice'],
            default: 'setter_created',
        },
        // For dynamic exams: generation criteria
        dynamicCriteria: {
            category: {
                type: String,
                enum: ['basic', 'intermediate', 'advanced', 'mixed'],
            },
            numberOfQuestions: { type: Number, default: 10 },
            subject: { type: String, default: '' },
        },
        // Participants allowed to take this exam
        assignedParticipants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        // Is this exam open to all participants?
        isPublic: {
            type: Boolean,
            default: false,
        },
        totalMarks: {
            type: Number,
            default: 0,
        },
        duration: {
            type: Number, // in minutes
            default: 30,
        },
        startTime: {
            type: Date,
        },
        endTime: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['draft', 'active', 'completed', 'cancelled'],
            default: 'draft',
        },
        category: {
            type: String,
            enum: ['basic', 'intermediate', 'advanced', 'mixed'],
            default: 'mixed',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);