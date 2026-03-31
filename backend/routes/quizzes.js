const express = require('express');
const router = express.Router();
const { getQuizzes, getQuiz, createQuiz, updateQuiz, deleteQuiz, getQuizStats } = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getQuizStats);
router.route('/').get(getQuizzes).post(authorize('admin'), createQuiz);
router.route('/:id').get(getQuiz).put(authorize('admin'), updateQuiz).delete(authorize('admin'), deleteQuiz);

module.exports = router;