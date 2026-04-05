const Quiz = require('../models/Quiz');

const getAllQuizzes = (filters = {}) => {
    const query = {};
    if (filters.subject) query.subjectName = filters.subject;
    if (filters.topic) query.topicName = filters.topic;
    if (filters.label) query.label = filters.label;
    return Quiz.find(query);
};

const createQuiz = (data) => Quiz.create(data);

const updateQuiz = async (id, data) => {
    const quiz = await Quiz.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!quiz) throw new Error('Quiz not found');
    return quiz;
};

const deleteQuiz = async (id) => {
    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) throw new Error('Quiz not found');
    return quiz;
};

module.exports = { getAllQuizzes, createQuiz, updateQuiz, deleteQuiz };