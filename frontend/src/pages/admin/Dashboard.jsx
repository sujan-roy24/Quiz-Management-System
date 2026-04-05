import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Overview from './Overview';
import Users from './Users';
import AdminQuizzes from './Quizzes';

const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'users', label: '👥 Users' },
    { key: 'quizzes', label: '📚 Quiz Bank' },
];

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [tab, setTab] = useState('overview');

    const [sidebarOpen, setSidebarOpen] = useState(false);


    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

            {/* Mobile hamburger — only visible on small screens */}
            <button
                className="admin-hamburger btn btn-ghost btn-sm"
                style={{ position: 'fixed', top: 12, left: 12, zIndex: 400, display: 'none' }}
                onClick={() => setSidebarOpen(o => !o)}
            >☰</button>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 299 }}
                />
            )}

            {/* Sidebar */}
            <div
                className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}
                style={{ width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'sticky', top: 0, height: '100vh' }}
            >
                {/* sidebar content unchanged */}
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '32px 28px', overflowY: 'auto' }}>
                {tab === 'overview' && <Overview />}
                {tab === 'users' && <Users />}
                {tab === 'quizzes' && <AdminQuizzes />}
            </div>
        </div>
    );

}
