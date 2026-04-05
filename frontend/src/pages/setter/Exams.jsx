import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { Spinner, Empty, StatusBadge, Modal, ErrorMessage, ParticipantPicker } from '../../components';
import { useToast } from '../../context/ToastContext';
import * as api from '../../api';

export default function SetterExams() {
    const nav = useNavigate();
    const toast = useToast();

    const [allowModal, setAllowModal] = useState(null);
    const [detailModal, setDetailModal] = useState(null);

    const [selectedIds, setSelectedIds] = useState([]);

    const [saving, setSaving] = useState(false);

    const [editModal, setEditModal] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', startDateTime: '', durationMinutes: '' });
    const [editing, setEditing] = useState(false);

    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');

    const [editDateError, setEditDateError] = useState('');


    const { data: exams, loading, error, reload } = useFetch(api.getMyExams);
    const displayed = (exams || [])
        .filter(ex => !statusFilter || ex.status === statusFilter)
        .filter(ex => !search || ex.title.toLowerCase().includes(search.toLowerCase()));

    const openEdit = (ex) => {
        setEditForm({
            title: ex.title,
            startDateTime: new Date(ex.startDateTime).toISOString().slice(0, 16),
            durationMinutes: ex.durationMinutes
        });
        setEditModal(ex);
    };

    const saveEdit = async () => {
        setEditing(true);
        try {
            await api.updateExam(editModal._id, {
                ...editForm,
                startDateTime: new Date(editForm.startDateTime).toISOString(),
                durationMinutes: Number(editForm.durationMinutes)
            });
            toast('Exam updated');
            setEditModal(null);
            reload();
        } catch (e) { toast(e.message, 'error'); }
        finally { setEditing(false); }
    };

    const addParticipants = async () => {
        if (!selectedIds.length) return;
        setSaving(true);
        try {
            await Promise.all(selectedIds.map(userId =>
                api.allowParticipant({ examId: allowModal._id, userId })
            ));
            toast(`${selectedIds.length} participant(s) added`);
            setSelectedIds([]);
            reload();
        } catch (e) { toast(e.message, 'error'); }
        finally { setSaving(false); }
    };

    const fmt = (d) => new Date(d).toLocaleString();

    return (
        <div className="page">
            <div className="page-header">
                <h1>My Exams</h1>
                <button className="btn btn-primary" onClick={() => nav('/setter/exams/create')}>+ Create Exam</button>
            </div>

            <ErrorMessage message={error} />
            <div className="filter-bar" style={{ marginBottom: 16 }}>
                <input
                    placeholder="Search exams…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ minWidth: 180 }}
                />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All statuses</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                </select>
                {(search || statusFilter) && (
                    <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setStatusFilter(''); }}>Clear</button>
                )}
            </div>

            <div className="card" style={{ padding: 0 }}>
                {loading ? <Spinner /> : !exams?.length ? (
                    <Empty title="No exams yet" message="Create your first exam to get started." />
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr><th>Title</th><th>Type</th><th>Start</th><th>Duration</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {displayed.map(ex => (
                                    <tr key={ex._id}>
                                        {/* Fix #12 - click title to see detail */}
                                        <td>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                style={{ padding: '2px 0', fontWeight: 600, color: 'var(--text)' }}
                                                onClick={() => setDetailModal(ex)}
                                            >
                                                {ex.title}
                                            </button>
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{ex.quizSelectionType}</td>
                                        <td style={{ fontSize: 13, color: 'var(--muted)' }}>{fmt(ex.startDateTime)}</td>
                                        <td>{ex.durationMinutes}m</td>
                                        <td><StatusBadge status={ex.status} /></td>
                                        <td>
                                            <div className="td-actions">
                                                <button className="btn btn-ghost btn-sm" onClick={() => { setAllowModal(ex); setSelectedIds([]); }}>Allow</button>
                                                <button className="btn btn-ghost btn-sm" onClick={() => nav(`/setter/exams/${ex._id}/results`)}>Results</button>
                                                {ex.status !== 'completed' && (
                                                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(ex)}>Edit</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Fix #11 - Allow modal showing existing participants */}
            {allowModal && (
                <Modal
                    title={`Manage Participants — ${allowModal.title}`}
                    onClose={() => setAllowModal(null)}
                    footer={<>
                        <button className="btn btn-ghost" onClick={() => setAllowModal(null)}>Close</button>
                        {/* <button className="btn btn-primary" onClick={addParticipant} disabled={saving || !userId.trim()}>
                            {saving ? <span className="spinner" /> : 'Add'}
                        </button> */}
                        <button className="btn btn-primary" onClick={addParticipants}
                            disabled={saving || !selectedIds.length}>
                            {saving ? <span className="spinner" /> : `Add (${selectedIds.length})`}
                        </button>
                    </>}
                >
                    {/* Fix #11 - list of already-allowed participants */}
                    {allowModal.allowedParticipants?.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                            <label>Already allowed ({allowModal.allowedParticipants.length})</label>
                            <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '8px 12px', maxHeight: 120, overflowY: 'auto' }}>
                                {allowModal.allowedParticipants.map(id => (
                                    <div key={id} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
                                        🧑 {typeof id === 'object' ? id.name || id._id : id}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="form-group">
                        <label>Add Participants</label>
                        <ParticipantPicker selected={selectedIds} onChange={setSelectedIds} />
                    </div>
                </Modal>
            )}

            {/* Fix #12 - exam detail modal */}
            {detailModal && (
                <Modal title="Exam Details" onClose={() => setDetailModal(null)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                        {[
                            ['Title', detailModal.title],
                            ['Status', <StatusBadge status={detailModal.status} />],
                            ['Type', detailModal.quizSelectionType],
                            ['Start', fmt(detailModal.startDateTime)],
                            ['Duration', `${detailModal.durationMinutes} minutes`],
                            ['Questions', detailModal.selectedQuizIds?.length ?? '—'],
                            ['Participants', detailModal.allowedParticipants?.length ?? 0],
                            ...(detailModal.quizSelectionType === 'dynamic' && detailModal.dynamicCriteria ? [
                                ['Subject', detailModal.dynamicCriteria.subject || 'Any'],
                                ['Topic', detailModal.dynamicCriteria.topic || 'Any'],
                                ['Level', detailModal.dynamicCriteria.label || 'Any'],
                            ] : [])
                        ].map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <span style={{ color: 'var(--muted)', minWidth: 100, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</span>
                                <span>{v}</span>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}
            {editModal && (
                <Modal
                    title="Edit Exam"
                    onClose={() => setEditModal(null)}
                    footer={<>
                        <button className="btn btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
                        <button className="btn btn-primary" onClick={saveEdit} disabled={editing}>
                            {editing ? <span className="spinner" /> : 'Save'}
                        </button>
                    </>}
                >
                    <div className="form-group">
                        <label>Title</label>
                        <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label>Start Date & Time</label>
                        <input type="datetime-local" value={editForm.startDateTime} onChange={e => {
                            setEditForm(f => ({ ...f, startDateTime: e.target.value }));
                            const selected = new Date(e.target.value);
                            const original = new Date(editModal.startDateTime);
                            const isUnchanged = selected.getTime() === original.getTime();
                            setEditDateError(!isUnchanged && selected <= new Date() ? 'Must be future or original time' : '');
                        }} />
                        {editDateError && <p className="form-error">{editDateError}</p>}
                    </div>

                    <button className="btn btn-primary" onClick={saveEdit} disabled={editing || !!editDateError}>
                        {editing ? <span className="spinner" /> : 'Save'}
                    </button>

                    <div className="form-group">
                        <label>Duration (minutes)</label>
                        <input type="number" value={editForm.durationMinutes} onChange={e => setEditForm(f => ({ ...f, durationMinutes: e.target.value }))} min={5} />
                    </div>
                </Modal>
            )}
        </div>
    );
}