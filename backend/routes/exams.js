const express = require('express');
const router = express.Router();
const { getExams, getExam, createManualExam, createDynamicExam, updateExam, deleteExam, assignParticipants } = require('../controllers/examController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getExams);
router.post('/manual', authorize('admin', 'setter'), createManualExam);
router.post('/dynamic', authorize('admin', 'setter', 'participant'), createDynamicExam);
router.route('/:id').get(getExam).put(authorize('admin', 'setter'), updateExam).delete(authorize('admin', 'setter'), deleteExam);
router.put('/:id/assign', authorize('admin', 'setter'), assignParticipants);

module.exports = router;