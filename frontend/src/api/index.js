const BASE = process.env.REACT_APP_API_URL;


const getToken = () => localStorage.getItem('token');

const req = async (method, url, body) => {
    const res = await fetch(BASE + url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
        },
        ...(body ? { body: JSON.stringify(body) } : {})
    });

    if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
    }

    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Request failed');
    return data;
};

const get = (url) => req('GET', url);
const post = (url, body) => req('POST', url, body);
const put = (url, body) => req('PUT', url, body);
const del = (url) => req('DELETE', url);

// Auth
export const login = (body) => post('/auth/login', body);
export const register = (body) => post('/auth/register', body);

// Quizzes
export const getQuizzes = (params = {}) => get('/quizzes?' + new URLSearchParams(params));
export const createQuiz = (body) => post('/quizzes', body);
export const updateQuiz = (id, body) => put(`/quizzes/${id}`, body);
export const deleteQuiz = (id) => del(`/quizzes/${id}`);
export const getSubjects = () => get('/quizzes/subjects');
export const getTopics = (subject) => get('/quizzes/topics' + (subject ? `?subject=${subject}` : ''));
export const getFilterOptions = () => get('/quizzes/filter-options');

// Exams
export const createExam = (body) => post('/exams', body);
export const createSelfExam = (body) => post('/exams/self', body);
export const allowParticipant = (body) => put('/exams/allow', body);
export const getMyExams = () => get('/exams/mine');
export const getAvailableExams = () => get('/exams/available');
export const getExamQuestions = (id) => get(`/exams/${id}/questions`);
export const getExamResults = (id) => get(`/exams/${id}/results`);
export const updateExam = (id, body) => put(`/exams/${id}`, body);
export const getUpcomingExams = () => get('/exams/upcoming');

// Attempts
export const submitAttempt = (body) => post('/attempts/submit', body);
export const getMyAttempts = () => get('/attempts/my');