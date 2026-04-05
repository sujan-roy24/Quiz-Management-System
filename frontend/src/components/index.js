import { Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
};

// Fix #2 - role-based nav links + fix #19 mobile navbar
const navLinks = {
  admin:       [{ to: '/admin', label: 'Quiz Bank' }],
  setter:      [{ to: '/setter', label: 'My Exams' }, { to: '/setter/exams/create', label: '+ Create' }],
  participant: [{ to: '/participant', label: 'Exams' }, { to: '/participant/attempts', label: 'My Attempts' }, { to: '/participant/self-exam', label: 'Self Exam' }],
};

export const Navbar = () => {
  const { user, logout } = useAuth();

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
            <span className="navbar-user" title={`Your ID: ${user.id}`}>
              <strong>{user.name}</strong>
              {' '}
              <span className={`badge badge-${user.role}`}>{user.role}</span>
            </span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
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