const express = require('express');
const { getStats, getUsers, createUser, changeRole, deleteUser, uploadQuizCSV } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();
router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'superadmin']));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id/role', changeRole);
router.delete('/users/:id', roleMiddleware(['superadmin']), deleteUser);
router.post('/quizzes/upload', uploadQuizCSV);

module.exports = router;