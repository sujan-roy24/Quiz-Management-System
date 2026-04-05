const Quiz = require('../models/Quiz');

const getDistinctSubjects = () => Quiz.distinct('subjectName');
const getDistinctTopics = (subject = null) =>
  Quiz.distinct('topicName', subject ? { subjectName: subject } : {});

module.exports = { getDistinctSubjects, getDistinctTopics };