const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');


const swaggerSetup = require('./config/swagger');

const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const examRoutes = require('./routes/examRoutes');
const attemptRoutes = require('./routes/attemptRoutes');
const adminRoutes = require('./routes/adminRoutes');

const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
    res.send('✅ Quiz API is running...');
});

// Swagger Docs
swaggerSetup(app);

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/attempts', attemptRoutes);

// Error Handling Middleware (ALWAYS LAST)
app.use(errorMiddleware);

module.exports = app;