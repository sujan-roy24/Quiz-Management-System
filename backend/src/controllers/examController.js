const examService = require('../services/examService');
const { withStatus } = require('../services/examService');
const Exam = require('../models/Exam');

const createExam = async (req, res) => {
    try {
        const exam = await examService.createExam({ ...req.body, createdBy: req.user.userId });
        res.status(201).json({ success: true, message: 'Exam created successfully', data: exam });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const createSelfExam = async (req, res) => {
    try {
        const examData = {
            ...req.body,
            createdBy: req.user.userId,
            quizSelectionType: 'dynamic',
            dynamicCriteria: { ...req.body.dynamicCriteria, label: 'basic' }
        };
        const exam = await examService.createExam(examData);
        res.status(201).json({ success: true, message: 'Self-exam created successfully', data: exam });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const allowParticipant = async (req, res) => {
    try {
        const { examId, userId } = req.body;
        const exam = await examService.allowParticipant(examId, userId, req.user.userId);
        res.json({ success: true, message: 'Participant added successfully', data: exam });
    } catch (err) {
        res.status(403).json({ success: false, message: err.message });
    }
};

const getAvailableExams = async (req, res) => {
    try {
        const exams = await examService.getAvailableExams(req.user.userId);
        res.json({ success: true, data: exams });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getExamQuestions = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id).populate('selectedQuizIds');
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        if (!exam.allowedParticipants.map(p => p.toString()).includes(req.user.userId))
            return res.status(403).json({ success: false, message: 'Not allowed' });

        if (new Date() < new Date(exam.startDateTime))
            return res.status(400).json({ success: false, message: 'Exam not started yet' });

        const endDateTime = new Date(exam.startDateTime.getTime() + exam.durationMinutes * 60000);

        // Strip correct answers
        const questions = exam.selectedQuizIds.map(({ _id, questionText, options }) =>
            ({ _id, questionText, options })
        );

        res.json({
            success: true,
            data: {
                exam: {
                    title: exam.title,
                    startDateTime: exam.startDateTime,
                    endDateTime,               // #7 — frontend timer uses this
                    durationMinutes: exam.durationMinutes
                },
                questions
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// #10 — ranking
const getExamResults = async (req, res) => {
    try {
        const results = await examService.getExamResults(req.params.id);
        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getMyExams = async (req, res) => {
    try {
        const exams = await examService.getMyExams(req.user.userId);
        res.json({ success: true, data: exams.map(withStatus) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateExam = async (req, res) => {
    try {
        const exam = await examService.updateExam(req.params.id, req.user.userId, req.body);
        res.json({ success: true, data: withStatus(exam) });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const getUpcomingExams = async (req, res) => {
    try {
        const exams = await examService.getUpcomingExams(req.user.userId);
        res.json({ success: true, data: exams });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { createExam, createSelfExam, allowParticipant, getAvailableExams, getExamQuestions, getExamResults, getMyExams, updateExam, getUpcomingExams };