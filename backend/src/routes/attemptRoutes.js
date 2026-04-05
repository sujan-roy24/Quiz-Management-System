const express = require('express');
const { submitAttempt, getMyAttempts } = require('../controllers/attemptController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();
router.use(authMiddleware);
router.use(roleMiddleware(['participant']));

router.post('/submit', submitAttempt);
router.get('/my', getMyAttempts);

module.exports = router;