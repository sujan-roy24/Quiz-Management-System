const express = require('express');
const { createExam, createSelfExam, allowParticipant, getAvailableExams, getExamQuestions, getExamResults, getMyExams, updateExam, getUpcomingExams } = require('../controllers/examController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { getParticipants } = require('../controllers/adminController');

const router = express.Router();
router.use(authMiddleware);

router.post('/', roleMiddleware(['setter']), createExam);
router.post('/self', roleMiddleware(['participant']), createSelfExam);
router.get('/mine', roleMiddleware(['setter']), getMyExams);
router.put('/allow', roleMiddleware(['setter', 'participant']), allowParticipant);
router.get('/available', roleMiddleware(['participant']), getAvailableExams);
router.get('/upcoming', roleMiddleware(['participant']), getUpcomingExams);

router.put('/:id', roleMiddleware(['setter']), updateExam);
router.get('/:id/questions', roleMiddleware(['participant']), getExamQuestions);
router.get('/:id/results', roleMiddleware(['setter', 'admin', 'superadmin']), getExamResults);

router.get('/participants', roleMiddleware(['setter', 'admin', 'superadmin']), getParticipants);

module.exports = router;