const quizService = require('../services/quizService');
const filterService = require('../services/filterService');

const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await quizService.getAllQuizzes(req.query);
        res.json({ success: true, data: quizzes });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createQuiz = async (req, res) => {
    try {
        const { subjectName, topicName, questionText, options, correctAnswer, label } = req.body;
        if (!subjectName || !topicName || !questionText || !options || !correctAnswer || !label)
            return res.status(400).json({ success: false, message: 'All fields required' });
        if (!Array.isArray(options) || options.length < 2)
            return res.status(400).json({ success: false, message: 'At least 2 options required' });

        const quiz = await quizService.createQuiz(req.body);
        res.status(201).json({ success: true, message: 'Quiz created successfully', data: quiz });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const updateQuiz = async (req, res) => {
    try {
        const quiz = await quizService.updateQuiz(req.params.id, req.body);
        res.json({ success: true, message: 'Quiz updated successfully', data: quiz });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const deleteQuiz = async (req, res) => {
    try {
        await quizService.deleteQuiz(req.params.id);
        res.json({ success: true, message: 'Quiz deleted successfully' });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
};

const getFilterOptions = async (req, res) => {
    try {
        const [subjects, topics] = await Promise.all([
            filterService.getDistinctSubjects(),
            filterService.getDistinctTopics(req.query.subject)
        ]);
        res.json({ success: true, data: { subjects, topics } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// #2 — separate endpoints for dropdowns
const getSubjects = async (req, res) => {
    try {
        const subjects = await filterService.getDistinctSubjects();
        res.json({ success: true, data: subjects });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getTopics = async (req, res) => {
    try {
        const topics = await filterService.getDistinctTopics(req.query.subject);
        res.json({ success: true, data: topics });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getMatchCount = async (req, res) => {
    try {
        const { subjects, topic, label } = req.query;
        const query = {};
        if (subjects) query.subjectName = { $in: subjects.split(',') };
        if (topic)    query.topicName = topic;
        if (label)    query.label = label;
        const count = await Quiz.countDocuments(query);
        res.json({ success: true, data: count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAllQuizzes, createQuiz, updateQuiz, deleteQuiz, getFilterOptions, getSubjects, getTopics, getMatchCount };