const express = require('express');
const { createExam, createSelfExam, allowParticipant, getAvailableExams, getExamQuestions, getExamResults, getMyExams, updateExam, getUpcomingExams } = require('../controllers/examController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.post('/', roleMiddleware(['setter']), createExam);
router.post('/self', roleMiddleware(['participant']), createSelfExam);
router.put('/allow', roleMiddleware(['setter', 'participant']), allowParticipant);
router.get('/available', roleMiddleware(['participant']), getAvailableExams);
router.get('/:id/questions', roleMiddleware(['participant']), getExamQuestions);
router.get('/:id/results', roleMiddleware(['setter', 'admin']), getExamResults);
router.get('/mine', roleMiddleware(['setter']), getMyExams);
router.put('/:id', roleMiddleware(['setter']), updateExam);
router.get('/upcoming', roleMiddleware(['participant']), getUpcomingExams);

module.exports = router;