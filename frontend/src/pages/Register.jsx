import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../api';

export default function Register() {
    const nav = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'participant' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.register({ name: form.name, email: form.email, password: form.password, role: form.role });
            nav('/login', { state: { message: 'Account created! Please sign in.' } });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card card">
                <div className="auth-logo">Quiz<span>.</span>MS</div>
                <h2 style={{ marginBottom: 20, fontSize: 20 }}>Create account</h2>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={submit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input value={form.name} onChange={set('name')} required autoFocus />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={form.email} onChange={set('email')} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={form.password} onChange={set('password')} minLength={6} required />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select value={form.role} onChange={set('role')}>
                            <option value="participant">Participant</option>
                            <option value="setter">Setter</option>
                        </select>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? <span className="spinner" /> : 'Create account'}
                    </button>
                </form>
                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}