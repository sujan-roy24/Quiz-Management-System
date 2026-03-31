const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, getParticipants } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/participants', authorize('admin', 'setter'), getParticipants);
router.route('/').get(authorize('admin'), getUsers).post(authorize('admin'), createUser);
router.route('/:id').put(authorize('admin'), updateUser).delete(authorize('admin'), deleteUser);

module.exports = router;