import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar, PrivateRoute, PublicRoute, NotFound } from './components';
import './styles/global.css';

import Login from './pages/Login';
import Register from './pages/Register';

import AdminQuizzes from './pages/admin/Quizzes';

import SetterExams from './pages/setter/Exams';
import CreateExam from './pages/setter/CreateExam';
import ExamResults from './pages/setter/ExamResults';

import AvailableExams from './pages/participant/AvailableExams';
import TakeExam from './pages/participant/TakeExam';
import ExamResult from './pages/participant/ExamResult';   // Fix #7
import MyAttempts from './pages/participant/MyAttempts';
import SelfExam from './pages/participant/SelfExam';

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  return (
    <div className="layout">
      <Navbar />
      <Routes>
        {/* Fix #1 - PublicRoute redirects logged-in users */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/" element={<RoleRedirect />} />

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminQuizzes /></PrivateRoute>} />

        {/* Setter */}
        <Route path="/setter" element={<PrivateRoute role="setter"><SetterExams /></PrivateRoute>} />
        <Route path="/setter/exams/create" element={<PrivateRoute role="setter"><CreateExam /></PrivateRoute>} />
        <Route path="/setter/exams/:id/results" element={<PrivateRoute role="setter"><ExamResults /></PrivateRoute>} />

        {/* Participant */}
        <Route path="/participant" element={<PrivateRoute role="participant"><AvailableExams /></PrivateRoute>} />
        <Route path="/participant/exam/:id" element={<PrivateRoute role="participant"><TakeExam /></PrivateRoute>} />
        <Route path="/participant/result" element={<PrivateRoute role="participant"><ExamResult /></PrivateRoute>} />
        <Route path="/participant/attempts" element={<PrivateRoute role="participant"><MyAttempts /></PrivateRoute>} />
        <Route path="/participant/self-exam" element={<PrivateRoute role="participant"><SelfExam /></PrivateRoute>} />

        {/* Fix #5 - real 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}