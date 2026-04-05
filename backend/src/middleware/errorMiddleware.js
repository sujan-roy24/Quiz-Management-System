const errorMiddleware = (err, req, res, next) => {
    console.error(err.message);

    if (err.code === 11000)
        return res.status(400).json({ success: false, message: 'Duplicate field value entered' });

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    res.status(500).json({ success: false, message: err.message || 'Server Error' });
};

module.exports = errorMiddleware;