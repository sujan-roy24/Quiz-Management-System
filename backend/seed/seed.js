const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Quiz = require('../models/Quiz');

const connectDB = require('../config/db');

const seed = async () => {
    await connectDB();
    await User.deleteMany({});
    await Quiz.deleteMany({});

    // Create admin
    const admin = await User.create({
        name: 'Admin User',
        email: 'admin@quiz.com',
        password: 'admin123',
        role: 'admin',
    });

    // Create setter
    const setter = await User.create({
        name: 'Exam Setter',
        email: 'setter@quiz.com',
        password: 'setter123',
        role: 'setter',
    });

    // Create participants
    await User.create([
        { name: 'Alice Johnson', email: 'alice@quiz.com', password: 'alice123', role: 'participant' },
        { name: 'Bob Smith', email: 'bob@quiz.com', password: 'bob123', role: 'participant' },
    ]);

    // Create sample quizzes
    const quizzes = [
        // Basic
        { subject: 'Mathematics', topic: 'Arithmetic', question: 'What is 5 + 3?', options: [{ text: '7', isCorrect: false }, { text: '8', isCorrect: true }, { text: '9', isCorrect: false }, { text: '10', isCorrect: false }], correctAnswer: '8', category: 'basic', marks: 1, createdBy: admin._id },
        { subject: 'Mathematics', topic: 'Arithmetic', question: 'What is 12 × 4?', options: [{ text: '44', isCorrect: false }, { text: '48', isCorrect: true }, { text: '52', isCorrect: false }, { text: '56', isCorrect: false }], correctAnswer: '48', category: 'basic', marks: 1, createdBy: admin._id },
        { subject: 'Science', topic: 'Physics', question: 'What is the speed of light?', options: [{ text: '3×10⁸ m/s', isCorrect: true }, { text: '3×10⁶ m/s', isCorrect: false }, { text: '3×10⁴ m/s', isCorrect: false }, { text: '3×10¹⁰ m/s', isCorrect: false }], correctAnswer: '3×10⁸ m/s', category: 'basic', marks: 1, createdBy: admin._id },
        { subject: 'English', topic: 'Grammar', question: 'Which is a noun?', options: [{ text: 'Run', isCorrect: false }, { text: 'Quickly', isCorrect: false }, { text: 'Beautiful', isCorrect: false }, { text: 'Apple', isCorrect: true }], correctAnswer: 'Apple', category: 'basic', marks: 1, createdBy: admin._id },
        { subject: 'History', topic: 'World History', question: 'In which year did World War II end?', options: [{ text: '1943', isCorrect: false }, { text: '1944', isCorrect: false }, { text: '1945', isCorrect: true }, { text: '1946', isCorrect: false }], correctAnswer: '1945', category: 'basic', marks: 1, createdBy: admin._id },

        // Intermediate
        { subject: 'Mathematics', topic: 'Algebra', question: 'Solve: 2x + 6 = 18', options: [{ text: 'x = 4', isCorrect: false }, { text: 'x = 5', isCorrect: false }, { text: 'x = 6', isCorrect: true }, { text: 'x = 7', isCorrect: false }], correctAnswer: 'x = 6', category: 'intermediate', marks: 2, createdBy: admin._id },
        { subject: 'Science', topic: 'Chemistry', question: 'What is the atomic number of Carbon?', options: [{ text: '4', isCorrect: false }, { text: '6', isCorrect: true }, { text: '8', isCorrect: false }, { text: '12', isCorrect: false }], correctAnswer: '6', category: 'intermediate', marks: 2, createdBy: admin._id },
        { subject: 'Science', topic: 'Biology', question: 'What is the powerhouse of the cell?', options: [{ text: 'Nucleus', isCorrect: false }, { text: 'Ribosome', isCorrect: false }, { text: 'Mitochondria', isCorrect: true }, { text: 'Golgi body', isCorrect: false }], correctAnswer: 'Mitochondria', category: 'intermediate', marks: 2, createdBy: admin._id },
        { subject: 'Computer Science', topic: 'Programming', question: 'Which data structure uses LIFO?', options: [{ text: 'Queue', isCorrect: false }, { text: 'Stack', isCorrect: true }, { text: 'Tree', isCorrect: false }, { text: 'Graph', isCorrect: false }], correctAnswer: 'Stack', category: 'intermediate', marks: 2, createdBy: admin._id },
        { subject: 'Mathematics', topic: 'Geometry', question: 'What is the area of a circle with radius 7cm? (π≈3.14)', options: [{ text: '143.72 cm²', isCorrect: false }, { text: '153.86 cm²', isCorrect: true }, { text: '163.54 cm²', isCorrect: false }, { text: '170.00 cm²', isCorrect: false }], correctAnswer: '153.86 cm²', category: 'intermediate', marks: 2, createdBy: admin._id },

        // Advanced
        { subject: 'Mathematics', topic: 'Calculus', question: 'What is the derivative of sin(x)?', options: [{ text: '-cos(x)', isCorrect: false }, { text: 'cos(x)', isCorrect: true }, { text: '-sin(x)', isCorrect: false }, { text: 'tan(x)', isCorrect: false }], correctAnswer: 'cos(x)', category: 'advanced', marks: 3, createdBy: admin._id },
        { subject: 'Computer Science', topic: 'Algorithms', question: 'What is the time complexity of QuickSort (average case)?', options: [{ text: 'O(n)', isCorrect: false }, { text: 'O(n log n)', isCorrect: true }, { text: 'O(n²)', isCorrect: false }, { text: 'O(log n)', isCorrect: false }], correctAnswer: 'O(n log n)', category: 'advanced', marks: 3, createdBy: admin._id },
        { subject: 'Science', topic: 'Quantum Physics', question: 'What does the Heisenberg Uncertainty Principle state?', options: [{ text: 'Energy is quantized', isCorrect: false }, { text: 'Mass and energy are equivalent', isCorrect: false }, { text: 'Position and momentum cannot both be precisely determined', isCorrect: true }, { text: 'Light behaves as a particle', isCorrect: false }], correctAnswer: 'Position and momentum cannot both be precisely determined', category: 'advanced', marks: 3, createdBy: admin._id },
        { subject: 'Computer Science', topic: 'Data Structures', question: 'In a B-Tree of order m, the maximum number of keys in a node is:', options: [{ text: 'm', isCorrect: false }, { text: 'm-1', isCorrect: true }, { text: '2m', isCorrect: false }, { text: '2m-1', isCorrect: false }], correctAnswer: 'm-1', category: 'advanced', marks: 3, createdBy: admin._id },
        { subject: 'Mathematics', topic: 'Linear Algebra', question: 'What is the determinant of a 2×2 identity matrix?', options: [{ text: '0', isCorrect: false }, { text: '2', isCorrect: false }, { text: '1', isCorrect: true }, { text: '-1', isCorrect: false }], correctAnswer: '1', category: 'advanced', marks: 3, createdBy: admin._id },
    ];

    await Quiz.insertMany(quizzes);

    console.log('✅ Seed data inserted successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('Admin  → admin@quiz.com  / admin123');
    console.log('Setter → setter@quiz.com / setter123');
    console.log('User   → alice@quiz.com  / alice123');
    process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });