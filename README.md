<div align="center">

# 🎯 Quiz Management System

**A full-stack web application for creating, managing, and taking online quizzes and exams.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-orange?style=for-the-badge)](https://quiz-management-system-2875.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge)](https://quiz-management-system-ugcn.onrender.com)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](#license)

![Quiz Management System Banner](https://via.placeholder.com/900x300/0f0f0f/f5a623?text=Quiz+Management+System)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Role System](#-role-system)
- [CSV Upload Format](#-csv-upload-format)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

Quiz Management System is a production-ready MERN stack application that enables institutions and individuals to create, manage, and participate in online examinations. It features a role-based access control system with four distinct user types, real-time exam timers, automatic scoring, and a comprehensive admin dashboard.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with 7-day token expiry
- Client-side token expiry validation
- Auto-logout on session expiry (401 detection)
- Role-based route protection
- Password hashing with bcryptjs

### 👑 Super Admin
- Full system dashboard with live statistics
- User management — create, update roles, delete users
- Quiz bank management with CSV bulk upload
- Oversight of all exams and attempts

### 🛡️ Admin
- Quiz bank CRUD operations
- Bulk import quizzes via CSV template
- Filter quizzes by subject, topic, and difficulty level
- Pagination and keyword search

### 📝 Setter (Exam Creator)
- Create exams with **manual** or **dynamic** question selection
- Dynamic selection: multi-subject picker, topic filter, difficulty level, live match count preview
- Schedule exam start time with future-only validation
- Manage participants via searchable checkbox dropdown
- View ranked results leaderboard
- Edit upcoming exams (completed exams are locked)

### 🎓 Participant
- View and take available exams with live countdown timer
- Auto-submit when time expires
- Progress bar tracking answered questions
- Create self-practice exams (Basic level, dynamic selection)
- Invite friends to self-exams via participant picker
- View attempt history with scores
- Result screen with percentage, color-coded feedback, and score bar

### 🎨 UI/UX
- Dark / Light mode toggle (persisted in localStorage)
- Responsive design — mobile, tablet, desktop
- Toast notifications (auto-dismiss + manual close)
- Loading spinners and empty states throughout
- 404 Not Found page

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework |
| React Router DOM | 7.x | Client-side routing |
| CSS Variables | — | Theming (dark/light mode) |
| Fetch API | — | HTTP requests |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 22.x | Runtime |
| Express | 5.x | Web framework |
| MongoDB | — | Database |
| Mongoose | 9.x | ODM |
| JWT | 9.x | Authentication |
| bcryptjs | 3.x | Password hashing |
| csv-parse | 6.x | CSV bulk import |
| helmet | 8.x | Security headers |
| morgan | 1.x | HTTP logging |
| swagger-ui-express | 5.x | API documentation |

### Infrastructure
| Service | Purpose |
|---|---|
| MongoDB Atlas | Cloud database (free tier) |
| Render | Backend hosting (free tier) |
| Vercel | Frontend hosting (free tier) |
| GitHub | Source control & CI/CD |

---

## 🏗 Architecture

```
Quiz-Management-System/
├── frontend/                  # React application
│   ├── public/
│   ├── src/
│   │   ├── api/               # Centralized API layer
│   │   │   └── index.js
│   │   ├── components/        # Reusable UI components
│   │   │   └── index.js       # Navbar, Modal, Spinner, ParticipantPicker...
│   │   ├── context/           # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── hooks/
│   │   │   └── useFetch.js    # Data fetching hook
│   │   ├── pages/
│   │   │   ├── admin/         # Dashboard, Overview, Users, Quizzes
│   │   │   ├── setter/        # Exams, CreateExam, ExamResults
│   │   │   ├── participant/   # AvailableExams, TakeExam, SelfExam...
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   └── styles/
│   │       └── global.css     # Design system + dark/light themes
│   ├── vercel.json
│   └── package.json
│
└── backend/                   # Express API server
    ├── src/
    │   ├── config/            # DB connection, Swagger setup
    │   ├── controllers/       # Route handlers
    │   │   ├── adminController.js
    │   │   ├── authController.js
    │   │   ├── examController.js
    │   │   ├── quizController.js
    │   │   └── attemptController.js
    │   ├── middleware/        # Auth, role, error middleware
    │   ├── models/            # Mongoose schemas
    │   │   ├── User.js
    │   │   ├── Exam.js
    │   │   ├── Quiz.js
    │   │   └── Attempt.js
    │   ├── routes/            # Express routers
    │   ├── services/          # Business logic layer
    │   ├── utils/             # JWT, password, random selector helpers
    │   └── seed.js            # Database seeder
    ├── swagger.yaml
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/sujan-roy24/Quiz-Management-System.git
cd Quiz-Management-System
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `.env` in the `backend` folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/quizMsDb
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
```

Seed the database:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

Backend runs at: `http://localhost:5000`
API Docs at: `http://localhost:5000/api-docs`

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create `.env` in the `frontend` folder:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost/quizMsDb` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key` |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## 📡 API Documentation

Full Swagger documentation available at `/api-docs` when running the backend.

### Key Endpoints

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login and get JWT |
| GET | `/admin/stats` | Admin+ | Dashboard statistics |
| GET | `/admin/users` | Admin+ | List all users |
| POST | `/admin/users` | Admin+ | Create user manually |
| PUT | `/admin/users/:id/role` | Admin+ | Change user role |
| DELETE | `/admin/users/:id` | Superadmin | Delete user |
| POST | `/admin/quizzes/upload` | Admin+ | Bulk CSV upload |
| GET | `/quizzes` | Admin+/Setter | List quizzes with filters |
| POST | `/quizzes` | Admin+ | Create quiz |
| GET | `/exams/mine` | Setter | Setter's own exams |
| POST | `/exams` | Setter | Create exam |
| PUT | `/exams/:id` | Setter | Update exam |
| GET | `/exams/available` | Participant | Active exams |
| GET | `/exams/upcoming` | Participant | Scheduled exams |
| GET | `/exams/:id/questions` | Participant | Exam questions |
| POST | `/attempts/submit` | Participant | Submit answers |
| GET | `/attempts/my` | Participant | Own attempt history |

---

## 👤 Role System

```
superadmin  ──▶  Full system control
    │
admin       ──▶  Quiz bank + user management (no admin creation)
    │
setter      ──▶  Exam creation + participant management
    │
participant ──▶  Take exams + self-practice
```

### Default Seed Credentials

| Role | Email | Password |
|---|---|---|
| Superadmin | superadmin@quiz.io | super123 |
| Admin | admin@quiz.io | admin123 |
| Setter | setter@quiz.io | setter123 |
| Participant | alice@quiz.io | alice123 |
| Participant | bob@quiz.io | bob123 |

> ⚠️ **Change all passwords in production!**

---

## 📄 CSV Upload Format

Admins can bulk upload quizzes using a CSV file. Download the template from the Quiz Bank tab.

### Column Format

```csv
subject,topic,question,option1,option2,option3,option4,correct,label
Math,Algebra,What is 2+2?,1,2,3,4,4,basic
Science,Physics,What is the unit of force?,Joule,Newton,Watt,Pascal,Newton,intermediate
```

### Rules
- `label` must be one of: `basic`, `intermediate`, `advanced`
- `correct` must exactly match one of the option values
- `option1` and `option2` are required; `option3` and `option4` are optional
- All other fields are required

---

## 🌐 Deployment

### Backend → Render (Free)

1. Push to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Set Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add environment variables in Render dashboard

### Frontend → Vercel (Free)

1. Import GitHub repo on [vercel.com](https://vercel.com)
2. Set Root Directory: `frontend`
3. Add environment variable: `REACT_APP_API_URL`
4. Deploy

### Database → MongoDB Atlas (Free)

1. Create free M0 cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Allow network access from `0.0.0.0/0`
3. Copy connection string to `MONGO_URI`

---

## 📸 Screenshots

> Screenshots coming soon — visit the [live demo](https://quiz-management-system-2875.vercel.app) to see the app in action.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Code Style
- Keep functions small and focused
- Use meaningful variable names
- Add comments for complex logic
- Follow existing patterns in the codebase

---

## 📝 License

This project is licensed under the ISC License.

---

<div align="center">

Built with ❤️ by [Sujan Roy](https://github.com/sujan-roy24)

⭐ Star this repo if you found it helpful!

</div>
