import { Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import * as api from '../api';

export const Avatar = ({ name }) => {
    const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return (
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', color: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
            {initials}
        </div>
    );
};
// Fix #1 - redirect already logged-in users away from auth pages
export const PublicRoute = ({ children }) => {
    const { user } = useAuth();
    if (user) return <Navigate to={`/${user.role}`} replace />;
    return children;
};

// PrivateRoute
export const PrivateRoute = ({ children, role }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    const allowed = Array.isArray(role) ? role : [role];
    if (role && !allowed.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
    return children;
};


// Fix #2 - role-based nav links + fix #19 mobile navbar
const navLinks = {
    superadmin: [
        { to: '/admin', label: 'Dashboard' }
    ],
    admin: [
        { to: '/admin', label: 'Dashboard' }
    ],
    setter: [
        { to: '/setter', label: 'My Exams' },
        { to: '/setter/exams/create', label: '+ Create' }
    ],
    participant: [
        { to: '/participant', label: 'Exams' },
        { to: '/participant/attempts', label: 'My Attempts' },
        { to: '/participant/self-exam', label: 'Self Exam' }
    ],
};


export const Navbar = () => {
    const { user, logout } = useAuth();

    if (user?.role === 'admin' || user?.role === 'superadmin') return null;
    // Fix #17 - logout confirmation
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) logout();
    };

    return (
        <nav className="navbar">
            <span className="navbar-brand">Quiz<span>.</span>io</span>

            {/* Fix #2 - role nav links */}
            {user && (
                <div className="navbar-links">
                    {(navLinks[user.role] || []).map(l => (
                        <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end>
                            {l.label}
                        </NavLink>
                    ))}
                </div>
            )}

            <div className="navbar-right">
                {user && (
                    <>
                        {/* Fix #9 - show user ID copyable */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <Avatar name={user.name} />

                            <span
                                className="navbar-user"
                                title={`Your ID: ${user.id}`}
                            >
                                <strong>{user.name}</strong>{' '}
                                <span className={`badge badge-${user.role}`}>
                                    {user.role}
                                </span>
                            </span>
                        </div>

                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

// Modal
export const Modal = ({ title, onClose, children, footer }) => (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal">
            <div className="modal-header">
                <h2>{title}</h2>
                <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
            </div>
            {children}
            {footer && <div className="modal-footer">{footer}</div>}
        </div>
    </div>
);

// Spinner
export const Spinner = () => (
    <div className="loading"><div className="spinner" /></div>
);

// Fix #18 - ErrorMessage component for consistent error display
export const ErrorMessage = ({ message }) => (
    message ? <div className="alert alert-error">{message}</div> : null
);

// Empty state - Fix #10 - optional action
export const Empty = ({ title = 'Nothing here', message = '', action }) => (
    <div className="empty">
        <h3>{title}</h3>
        {message && <p>{message}</p>}
        {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
);

// Status badge
export const StatusBadge = ({ status }) => (
    <span className={`badge badge-${status}`}>{status}</span>
);

// Label badge
export const LabelBadge = ({ label }) => (
    <span className={`badge badge-${label}`}>{label}</span>
);

// Fix #5 - NotFound page
export const NotFound = () => (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
        <h1 style={{ fontSize: 64, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>404</h1>
        <h2 style={{ marginBottom: 10 }}>Page not found</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
        <NavLink to="/" className="btn btn-primary">Go home</NavLink>
    </div>
);

// Fix #9 - CopyID component for participant to copy their own ID
export const CopyID = ({ id }) => {
    const copy = () => {
        navigator.clipboard.writeText(id);
    };
    return (
        <div className="copy-id">
            <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                Your ID: {id?.slice(0, 8)}…
            </span>
            <button className="btn btn-ghost btn-sm" onClick={copy} title="Copy full ID">Copy ID</button>
        </div>
    );
};


export const ParticipantPicker = ({ selected, onChange }) => {
    const [participants, setParticipants] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.getParticipants().then(r => setParticipants(r.data)).catch(() => { });
    }, []);

    const filtered = participants.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    );

    const toggle = (id) => {
        onChange(selected.includes(id)
            ? selected.filter(x => x !== id)
            : [...selected, id]
        );
    };

    return (
        <div>
            <input
                placeholder="Search participants…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ marginBottom: 8 }}
            />
            <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 8 }}>
                {filtered.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>No participants found</p>}
                {filtered.map(p => (
                    <label key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px', cursor: 'pointer', fontSize: 13 }}>
                        <input
                            type="checkbox"
                            checked={selected.includes(p._id)}
                            onChange={() => toggle(p._id)}
                            style={{ accentColor: 'var(--accent)' }}
                        />
                        <span style={{ flex: 1 }}>{p.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{p.email}</span>
                    </label>
                ))}
            </div>
            {selected.length > 0 && (
                <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6 }}>{selected.length} selected</p>
            )}
        </div>
    );
};