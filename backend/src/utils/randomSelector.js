const Quiz = require('../models/Quiz');

const getRandomQuizzes = async (filters, count) => {
    const query = {};
    if (filters.subject) query.subjectName = filters.subject;
    if (filters.topic) query.topicName = filters.topic;
    if (filters.label) query.label = filters.label;

    const total = await Quiz.countDocuments(query);
    if (total < count) throw new Error(`Only ${total} quizzes available, but ${count} requested`);

    return await Quiz.aggregate([{ $match: query }, { $sample: { size: count } }]);
};

module.exports = { getRandomQuizzes };