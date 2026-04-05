const express = require('express');
const { getAllQuizzes, createQuiz, updateQuiz, deleteQuiz, getFilterOptions, getSubjects, getTopics, getMatchCount } = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();
router.use(authMiddleware);

// Static routes first
router.get('/filter-options', getFilterOptions);
router.get('/subjects', getSubjects);
router.get('/topics', getTopics);

router.get('/', roleMiddleware(['admin', 'superadmin', 'setter']), getAllQuizzes);
router.post('/', roleMiddleware(['admin', 'superadmin']), createQuiz);
router.put('/:id', roleMiddleware(['admin', 'superadmin']), updateQuiz);
router.delete('/:id', roleMiddleware(['admin', 'superadmin']), deleteQuiz);

router.get('/match-count', roleMiddleware(['admin', 'superadmin', 'setter']), getMatchCount);

module.exports = router;