const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
});

const quizSchema = new mongoose.Schema(
    {
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
        },
        topic: {
            type: String,
            required: [true, 'Topic is required'],
            trim: true,
        },
        question: {
            type: String,
            required: [true, 'Question is required'],
            trim: true,
        },
        options: {
            type: [optionSchema],
            validate: {
                validator: function (opts) {
                    return opts.length >= 2 && opts.length <= 6;
                },
                message: 'A quiz must have between 2 and 6 options',
            },
        },
        correctAnswer: {
            type: String,
            required: [true, 'Correct answer is required'],
        },
        category: {
            type: String,
            enum: ['basic', 'intermediate', 'advanced'],
            required: [true, 'Category is required'],
        },
        marks: {
            type: Number,
            default: 1,
            min: 1,
            max: 10,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        tags: [{ type: String, trim: true }],
    },
    { timestamps: true }
);

// Index for efficient querying
quizSchema.index({ category: 1, subject: 1, topic: 1 });

module.exports = mongoose.model('Quiz', quizSchema);