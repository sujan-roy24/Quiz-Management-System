require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Quiz = require('./models/Quiz');


const users = [
    { name: 'Super Admin', email: 'superadmin@quiz.com', password: 'super123', role: 'superadmin' },
    { name: 'Admin User', email: 'admin@quiz.com', password: 'admin123', role: 'admin' },
    { name: 'John Setter', email: 'setter@quiz.com', password: 'setter123', role: 'setter' },
    { name: 'Alice Participant', email: 'alice@quiz.com', password: 'alice123', role: 'participant' },
    { name: 'Bob Participant', email: 'bob@quiz.com', password: 'bob123', role: 'participant' },
];

const quizzes = [
    // Math - Algebra - Basic
    {
        subjectName: 'Math', topicName: 'Algebra', label: 'basic',
        questionText: 'What is 2x + 3 = 7? Solve for x.',
        options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'], correctAnswer: 'x = 2'
    },
    {
        subjectName: 'Math', topicName: 'Algebra', label: 'basic',
        questionText: 'What is the value of 5² ?',
        options: ['10', '20', '25', '15'], correctAnswer: '25'
    },
    {
        subjectName: 'Math', topicName: 'Algebra', label: 'basic',
        questionText: 'Simplify: 3(x + 4) = ?',
        options: ['3x + 4', '3x + 12', 'x + 12', '3x + 7'], correctAnswer: '3x + 12'
    },
    {
        subjectName: 'Math', topicName: 'Algebra', label: 'basic',
        questionText: 'If y = 3x and x = 4, what is y?',
        options: ['7', '12', '9', '16'], correctAnswer: '12'
    },
    {
        subjectName: 'Math', topicName: 'Algebra', label: 'basic',
        questionText: 'What is the slope of y = 2x + 5?',
        options: ['5', '2', '7', '1'], correctAnswer: '2'
    },

    // Math - Algebra - Intermediate
    {
        subjectName: 'Math', topicName: 'Algebra', label: 'intermediate',
        questionText: 'Solve: x² - 5x + 6 = 0. What are the roots?',
        options: ['x = 2, 3', 'x = 1, 6', 'x = -2, -3', 'x = 3, 4'], correctAnswer: 'x = 2, 3'
    },
    {
        subjectName: 'Math', topicName: 'Algebra', label: 'intermediate',
        questionText: 'What is the discriminant of x² + 4x + 4?',
        options: ['0', '4', '8', '16'], correctAnswer: '0'
    },
    {
        subjectName: 'Math', topicName: 'Algebra', label: 'intermediate',
        questionText: 'If f(x) = x² + 2x, what is f(3)?',
        options: ['9', '12', '15', '11'], correctAnswer: '15'
    },

    // Math - Geometry - Basic
    {
        subjectName: 'Math', topicName: 'Geometry', label: 'basic',
        questionText: 'What is the area of a rectangle with length 8 and width 5?',
        options: ['30', '40', '26', '45'], correctAnswer: '40'
    },
    {
        subjectName: 'Math', topicName: 'Geometry', label: 'basic',
        questionText: 'How many degrees are in a triangle?',
        options: ['90', '180', '270', '360'], correctAnswer: '180'
    },
    {
        subjectName: 'Math', topicName: 'Geometry', label: 'basic',
        questionText: 'What is the circumference of a circle with radius 7? (Use π ≈ 3.14)',
        options: ['21.98', '43.96', '49', '153.86'], correctAnswer: '43.96'
    },
    {
        subjectName: 'Math', topicName: 'Geometry', label: 'basic',
        questionText: 'What is the perimeter of a square with side 6?',
        options: ['12', '24', '36', '18'], correctAnswer: '24'
    },

    // Math - Geometry - Advanced
    {
        subjectName: 'Math', topicName: 'Geometry', label: 'advanced',
        questionText: 'What is the volume of a sphere with radius 3? (Use π ≈ 3.14)',
        options: ['75.36', '113.04', '150.72', '28.26'], correctAnswer: '113.04'
    },
    {
        subjectName: 'Math', topicName: 'Geometry', label: 'advanced',
        questionText: 'In a right triangle, if the two legs are 6 and 8, what is the hypotenuse?',
        options: ['10', '12', '14', '9'], correctAnswer: '10'
    },

    // Science - Physics - Basic
    {
        subjectName: 'Science', topicName: 'Physics', label: 'basic',
        questionText: 'What is the unit of force?',
        options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctAnswer: 'Newton'
    },
    {
        subjectName: 'Science', topicName: 'Physics', label: 'basic',
        questionText: 'What is the speed of light in vacuum?',
        options: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'], correctAnswer: '3×10⁸ m/s'
    },
    {
        subjectName: 'Science', topicName: 'Physics', label: 'basic',
        questionText: 'Which law states that every action has an equal and opposite reaction?',
        options: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Hooke's Law"], correctAnswer: "Newton's 3rd Law"
    },
    {
        subjectName: 'Science', topicName: 'Physics', label: 'basic',
        questionText: 'What is the formula for kinetic energy?',
        options: ['mgh', '½mv²', 'mv', 'Fd'], correctAnswer: '½mv²'
    },
    {
        subjectName: 'Science', topicName: 'Physics', label: 'basic',
        questionText: 'What does Ohm\'s Law state?',
        options: ['V = IR', 'P = IV', 'E = mc²', 'F = ma'], correctAnswer: 'V = IR'
    },

    // Science - Physics - Intermediate
    {
        subjectName: 'Science', topicName: 'Physics', label: 'intermediate',
        questionText: 'A car accelerates from 0 to 20 m/s in 4 seconds. What is its acceleration?',
        options: ['4 m/s²', '5 m/s²', '80 m/s²', '10 m/s²'], correctAnswer: '5 m/s²'
    },
    {
        subjectName: 'Science', topicName: 'Physics', label: 'intermediate',
        questionText: 'What is the work done when a 10N force moves an object 5m?',
        options: ['2 J', '15 J', '50 J', '0.5 J'], correctAnswer: '50 J'
    },
    {
        subjectName: 'Science', topicName: 'Physics', label: 'intermediate',
        questionText: 'What type of wave is sound?',
        options: ['Transverse', 'Electromagnetic', 'Longitudinal', 'Surface'], correctAnswer: 'Longitudinal'
    },

    // Science - Chemistry - Basic
    {
        subjectName: 'Science', topicName: 'Chemistry', label: 'basic',
        questionText: 'What is the chemical symbol for water?',
        options: ['HO', 'H₂O', 'H₂O₂', 'OH'], correctAnswer: 'H₂O'
    },
    {
        subjectName: 'Science', topicName: 'Chemistry', label: 'basic',
        questionText: 'How many elements are in the periodic table?',
        options: ['108', '112', '118', '120'], correctAnswer: '118'
    },
    {
        subjectName: 'Science', topicName: 'Chemistry', label: 'basic',
        questionText: 'What is the atomic number of Carbon?',
        options: ['4', '6', '8', '12'], correctAnswer: '6'
    },
    {
        subjectName: 'Science', topicName: 'Chemistry', label: 'basic',
        questionText: 'What type of bond is formed by sharing electrons?',
        options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], correctAnswer: 'Covalent'
    },

    // Science - Chemistry - Intermediate
    {
        subjectName: 'Science', topicName: 'Chemistry', label: 'intermediate',
        questionText: 'What is the pH of a neutral solution?',
        options: ['0', '7', '14', '5'], correctAnswer: '7'
    },
    {
        subjectName: 'Science', topicName: 'Chemistry', label: 'intermediate',
        questionText: 'Which gas is produced when acid reacts with a metal?',
        options: ['Oxygen', 'Carbon Dioxide', 'Hydrogen', 'Nitrogen'], correctAnswer: 'Hydrogen'
    },

    // English - Grammar - Basic
    {
        subjectName: 'English', topicName: 'Grammar', label: 'basic',
        questionText: 'Which sentence is grammatically correct?',
        options: ['She go to school.', 'She goes to school.', 'She going to school.', 'She gone to school.'], correctAnswer: 'She goes to school.'
    },
    {
        subjectName: 'English', topicName: 'Grammar', label: 'basic',
        questionText: 'What is the plural of "child"?',
        options: ['Childs', 'Childes', 'Children', 'Childrens'], correctAnswer: 'Children'
    },
    {
        subjectName: 'English', topicName: 'Grammar', label: 'basic',
        questionText: 'Which word is a noun in: "The dog runs fast"?',
        options: ['runs', 'fast', 'The', 'dog'], correctAnswer: 'dog'
    },
    {
        subjectName: 'English', topicName: 'Grammar', label: 'basic',
        questionText: 'What is the past tense of "go"?',
        options: ['Goed', 'Gone', 'Went', 'Going'], correctAnswer: 'Went'
    },
    {
        subjectName: 'English', topicName: 'Grammar', label: 'basic',
        questionText: 'Which is the correct article: "___ honest man"?',
        options: ['A', 'An', 'The', 'No article'], correctAnswer: 'An'
    },

    // English - Grammar - Intermediate
    {
        subjectName: 'English', topicName: 'Grammar', label: 'intermediate',
        questionText: 'Identify the type: "Running fast, he caught the bus."',
        options: ['Simple sentence', 'Compound sentence', 'Complex sentence', 'Participial phrase'], correctAnswer: 'Participial phrase'
    },
    {
        subjectName: 'English', topicName: 'Grammar', label: 'intermediate',
        questionText: 'Which is correct? "Neither the students nor the teacher ___ ready."',
        options: ['were', 'was', 'are', 'have been'], correctAnswer: 'was'
    },

    // English - Vocabulary - Basic
    {
        subjectName: 'English', topicName: 'Vocabulary', label: 'basic',
        questionText: 'What is the synonym of "happy"?',
        options: ['Sad', 'Joyful', 'Angry', 'Tired'], correctAnswer: 'Joyful'
    },
    {
        subjectName: 'English', topicName: 'Vocabulary', label: 'basic',
        questionText: 'What is the antonym of "ancient"?',
        options: ['Old', 'Aged', 'Modern', 'Historic'], correctAnswer: 'Modern'
    },
    {
        subjectName: 'English', topicName: 'Vocabulary', label: 'basic',
        questionText: 'What does "benevolent" mean?',
        options: ['Cruel', 'Kind-hearted', 'Lazy', 'Greedy'], correctAnswer: 'Kind-hearted'
    },

    // CS - Programming - Basic
    {
        subjectName: 'Computer Science', topicName: 'Programming', label: 'basic',
        questionText: 'What does HTML stand for?',
        options: ['Hyper Text Markup Language', 'High Text Machine Language', 'Hyper Transfer Markup Logic', 'Home Tool Markup Language'], correctAnswer: 'Hyper Text Markup Language'
    },
    {
        subjectName: 'Computer Science', topicName: 'Programming', label: 'basic',
        questionText: 'Which symbol is used for single-line comments in JavaScript?',
        options: ['#', '//', '/* */', '--'], correctAnswer: '//'
    },
    {
        subjectName: 'Computer Science', topicName: 'Programming', label: 'basic',
        questionText: 'What does CSS stand for?',
        options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Colorful Style Sheets'], correctAnswer: 'Cascading Style Sheets'
    },
    {
        subjectName: 'Computer Science', topicName: 'Programming', label: 'basic',
        questionText: 'Which data type stores true or false?',
        options: ['String', 'Integer', 'Boolean', 'Float'], correctAnswer: 'Boolean'
    },
    {
        subjectName: 'Computer Science', topicName: 'Programming', label: 'basic',
        questionText: 'What is the output of: console.log(2 + "3") in JavaScript?',
        options: ['5', '"23"', '23', 'Error'], correctAnswer: '23'
    },

    // CS - Programming - Intermediate
    {
        subjectName: 'Computer Science', topicName: 'Programming', label: 'intermediate',
        questionText: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correctAnswer: 'O(log n)'
    },
    {
        subjectName: 'Computer Science', topicName: 'Programming', label: 'intermediate',
        questionText: 'Which HTTP method is used to update an existing resource?',
        options: ['GET', 'POST', 'PUT', 'DELETE'], correctAnswer: 'PUT'
    },
    {
        subjectName: 'Computer Science', topicName: 'Programming', label: 'intermediate',
        questionText: 'What does REST stand for?',
        options: ['Remote Execution State Transfer', 'Representational State Transfer', 'Resource State Transfer', 'Remote State Transfer'], correctAnswer: 'Representational State Transfer'
    },

    // CS - Programming - Advanced
    {
        subjectName: 'Computer Science', topicName: 'Programming', label: 'advanced',
        questionText: 'What is a closure in JavaScript?',
        options: ['A loop that closes after execution', 'A function that retains access to its lexical scope', 'A method to close database connections', 'A type of error handling'], correctAnswer: 'A function that retains access to its lexical scope'
    },
    {
        subjectName: 'Computer Science', topicName: 'Programming', label: 'advanced',
        questionText: 'Which sorting algorithm has the best average-case time complexity?',
        options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'], correctAnswer: 'Merge Sort'
    },

    // CS - Databases - Basic
    {
        subjectName: 'Computer Science', topicName: 'Databases', label: 'basic',
        questionText: 'What does SQL stand for?',
        options: ['Structured Query Language', 'Simple Query Logic', 'System Query Language', 'Standard Query List'], correctAnswer: 'Structured Query Language'
    },
    {
        subjectName: 'Computer Science', topicName: 'Databases', label: 'basic',
        questionText: 'Which SQL command retrieves data from a table?',
        options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'], correctAnswer: 'SELECT'
    },
    {
        subjectName: 'Computer Science', topicName: 'Databases', label: 'basic',
        questionText: 'What is a primary key?',
        options: ['A key that can be null', 'A unique identifier for each record', 'A foreign table reference', 'A duplicate column'], correctAnswer: 'A unique identifier for each record'
    },
];

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Upsert users — only create if email doesn't exist
    let createdCount = 0;
    for (const u of users) {
        const exists = await User.findOne({ email: u.email });
        if (!exists) {
            await User.create({
                name: u.name,
                email: u.email,
                passwordHash: await bcrypt.hash(u.password, 10),
                role: u.role
            });
            createdCount++;
        }
    }
    console.log(`👤 ${createdCount} new users seeded (${users.length - createdCount} already existed)`);

    // Only seed quizzes if none exist
    const quizCount = await Quiz.countDocuments();
    if (quizCount === 0) {
        await Quiz.insertMany(quizzes);
        console.log(`📝 Seeded ${quizzes.length} quizzes`);
    } else {
        console.log(`📝 Skipped quizzes — ${quizCount} already exist`);
    }

    console.log('\n🔑 Login credentials:');
    users.forEach(u => console.log(`   ${u.role.padEnd(12)} ${u.email}  /  ${u.password}`));

    await mongoose.disconnect();
    console.log('\n✅ Seeding complete');
};

seed().catch(err => { console.error(err); process.exit(1); });