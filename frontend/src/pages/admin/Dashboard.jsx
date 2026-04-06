import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Overview from './Overview';
import Users from './Users';
import AdminQuizzes from './Quizzes';

const tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'users',    label: 'Users',    icon: '👥' },
    { key: 'quizzes',  label: 'Quiz Bank', icon: '📚' },
];

export default function Dashboard() {
    const { user, logout }  = useAuth();
    const { theme, toggle } = useTheme();
    const [tab, setTab]     = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) logout();
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

            {/* Mobile hamburger button */}
            <button
                className="admin-hamburger btn btn-ghost btn-sm"
                style={{
                    position: 'fixed', top: 14, left: 14, zIndex: 400,
                    display: 'none'   // shown via CSS .admin-hamburger rule
                }}
                onClick={() => setSidebarOpen(o => !o)}
            >
                ☰
            </button>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 299
                    }}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}
                style={{
                    width: 220,
                    background: 'var(--bg2)',
                    borderRight: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px 0',
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    zIndex: 300,
                    flexShrink: 0,
                }}
            >
                {/* Brand */}
                <div style={{
                    padding: '0 20px 24px',
                    fontFamily: 'var(--font-head)',
                    fontSize: 20,
                    fontWeight: 800,
                    color: 'var(--text)',
                    borderBottom: '1px solid var(--border)',
                    marginBottom: 8,
                }}>
                    Quiz<span style={{ color: 'var(--accent)' }}>.</span>MS
                </div>

                {/* Nav tabs */}
                <nav style={{ flex: 1, paddingTop: 8 }}>
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            onClick={() => { setTab(t.key); setSidebarOpen(false); }}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '11px 20px',
                                background: tab === t.key ? 'rgba(245,166,35,0.1)' : 'transparent',
                                color: tab === t.key ? 'var(--accent)' : 'var(--muted)',
                                border: 'none',
                                borderLeft: tab === t.key ? '3px solid var(--accent)' : '3px solid transparent',
                                fontSize: 14,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                transition: 'all 0.15s',
                                fontFamily: 'var(--font-body)',
                            }}
                        >
                            <span>{t.icon}</span>
                            <span>{t.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Bottom section */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>

                    {/* User info */}
                    <div style={{ marginBottom: 14 }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4
                        }}>
                            {/* Avatar */}
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'var(--accent)', color: '#0f0f0f',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                                flexShrink: 0,
                            }}>
                                {user.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
                                    {user.name}
                                </div>
                                <div style={{
                                    fontSize: 10, color: 'var(--accent)',
                                    fontFamily: 'var(--font-mono)',
                                    textTransform: 'uppercase', letterSpacing: '0.06em'
                                }}>
                                    {user.role}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Theme toggle */}
                    <button
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
                        onClick={toggle}
                        title="Toggle light/dark mode"
                    >
                        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>

                    {/* Logout */}
                    <button
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'center', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main style={{
                flex: 1,
                padding: '32px 28px',
                overflowY: 'auto',
                background: 'var(--bg)',
                minWidth: 0,   // prevents flex overflow
            }}>
                {tab === 'overview' && <Overview />}
                {tab === 'users'    && <Users />}
                {tab === 'quizzes'  && <AdminQuizzes />}
            </main>
        </div>
    );
}