const attemptService = require('../services/attemptService');

const submitAttempt = async (req, res) => {
    try {
        const attempt = await attemptService.submitAttempt(req.user.userId, req.body.examId, req.body.answers);
        res.json({ success: true, data: attempt });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const getMyAttempts = async (req, res) => {
    try {
        const attempts = await attemptService.getUserAttempts(req.user.userId);
        res.json({ success: true, data: attempts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { submitAttempt, getMyAttempts };