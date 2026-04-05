import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { Spinner, Modal, Empty, ErrorMessage } from '../../components';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api';

const getRoles = (myRole) => {
    const base = ['participant', 'setter'];
    if (myRole === 'superadmin') base.push('admin');
    return base;
};

export default function Users() {
    const toast = useToast();
    const { user: me } = useAuth();
    const { data: users, loading, error, reload } = useFetch(api.getAdminUsers);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'participant' });
    const [saving, setSaving] = useState(false);

    const displayed = (users || [])
        .filter(u => !roleFilter || u.role === roleFilter)
        .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

    const createUser = async () => {
        setSaving(true);
        try {
            await api.createAdminUser(form);
            toast('User created');
            setModal(false);
            setForm({ name: '', email: '', password: '', role: 'participant' });
            reload();
        } catch (e) { toast(e.message, 'error'); }
        finally { setSaving(false); }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Change role to "${newRole}"?`)) return;
        try {
            await api.changeUserRole(userId, newRole);
            toast('Role updated');
            reload();
        } catch (e) { toast(e.message, 'error'); }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await api.deleteAdminUser(userId);
            toast('User deleted');
            reload();
        } catch (e) { toast(e.message, 'error'); }
    };

    const canChangeRole = (target) => {
        if (target.role === 'superadmin') return false;
        if (target._id === me.id) return false;
        if (target.role === 'admin' && me.role !== 'superadmin') return false;
        return true;
    };

    return (
        <div>
            <div className="page-header">
                <h1 style={{ fontSize: 24 }}>Users</h1>
                <button className="btn btn-primary" onClick={() => setModal(true)}>+ Create User</button>
            </div>

            <div className="filter-bar">
                <input placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: 200 }} />
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                    <option value="">All roles</option>
                    <option value="superadmin">Superadmin</option>
                    <option value="admin">Admin</option>
                    <option value="setter">Setter</option>
                    <option value="participant">Participant</option>
                </select>
                {(search || roleFilter) && <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setRoleFilter(''); }}>Clear</button>}
            </div>

            <ErrorMessage message={error} />

            <div className="card" style={{ padding: 0 }}>
                {loading ? <Spinner /> : !displayed.length ? <Empty title="No users found" /> : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {displayed.map(u => (
                                    <tr key={u._id}>
                                        <td style={{ fontWeight: 500 }}>{u.name}{u._id === me.id && <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 6 }}>(you)</span>}</td>
                                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{u.email}</td>
                                        <td>
                                            {canChangeRole(u) ? (
                                                <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                                                    style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}>
                                                    {getRoles(me.role).map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            ) : (
                                                <span className={`badge badge-${u.role}`}>{u.role}</span>
                                            )}
                                        </td>
                                        <td>
                                            {me.role === 'superadmin' && u.role !== 'superadmin' && u._id !== me.id && (
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>Delete</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modal && (
                <Modal title="Create User" onClose={() => setModal(false)}
                    footer={<>
                        <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={createUser} disabled={saving}>
                            {saving ? <span className="spinner" /> : 'Create'}
                        </button>
                    </>}>
                    {['name', 'email', 'password'].map(field => (
                        <div className="form-group" key={field}>
                            <label>{field}</label>
                            <input
                                type={field === 'password' ? 'password' : 'text'}
                                value={form[field]}
                                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                            />
                        </div>
                    ))}
                    <div className="form-group">
                        <label>Role</label>
                        <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                            <option value="participant">Participant</option>
                            <option value="setter">Setter</option>
                            {me.role === 'superadmin' && <option value="admin">Admin</option>}
                        </select>
                    </div>
                </Modal>
            )}
        </div>
    );
}