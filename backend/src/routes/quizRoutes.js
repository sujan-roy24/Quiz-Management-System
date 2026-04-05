const express = require('express');
const { getAllQuizzes, createQuiz, updateQuiz, deleteQuiz, getFilterOptions, getSubjects, getTopics } = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();
router.use(authMiddleware);

// Static routes first
router.get('/filter-options', getFilterOptions);
router.get('/subjects', getSubjects);
router.get('/topics', getTopics);

router.get('/', roleMiddleware(['admin']), getAllQuizzes);
router.post('/', roleMiddleware(['admin']), createQuiz);
router.put('/:id', roleMiddleware(['admin']), updateQuiz);
router.delete('/:id', roleMiddleware(['admin']), deleteQuiz);

module.exports = router;