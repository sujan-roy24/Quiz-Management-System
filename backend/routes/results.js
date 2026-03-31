const express = require('express');
const router = express.Router();
const { startExam, submitExam, getResult, getMyResults, getExamResults, getOverviewStats } = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/my', getMyResults);
router.get('/stats/overview', authorize('admin'), getOverviewStats);
router.post('/start/:examId', authorize('participant'), startExam);
router.post('/submit/:examId', authorize('participant'), submitExam);
router.get('/exam/:examId', authorize('admin', 'setter'), getExamResults);
router.get('/:id', getResult);

module.exports = router;