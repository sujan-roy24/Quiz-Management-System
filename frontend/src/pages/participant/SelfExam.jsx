import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { ParticipantPicker } from '../../components';

const nowPlus10Min = () => new Date(Date.now() + 10 * 60000).toISOString().slice(0, 16);

export default function SelfExam() {
    const nav = useNavigate();
    const toast = useToast();
    const { user } = useAuth();

    const [form, setForm] = useState({
        title: '', startDateTime: nowPlus10Min(), durationMinutes: 20,
        dynamicCriteria: { subject: '', topic: '', count: 5 }
    });

    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);
    const [saving, setSaving] = useState(false);
    const [created, setCreated] = useState(null);


    const [selectedFriends, setSelectedFriends] = useState([]);
    const [adding, setAdding] = useState(false);

    useEffect(() => { api.getSubjects().then(r => setSubjects(r.data)).catch(() => { }); }, []);
    useEffect(() => {
        if (form.dynamicCriteria.subject)
            api.getTopics(form.dynamicCriteria.subject).then(r => setTopics(r.data)).catch(() => { });
    }, [form.dynamicCriteria.subject]);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
    const setCriteria = (k) => (e) => setForm(f => ({ ...f, dynamicCriteria: { ...f.dynamicCriteria, [k]: e.target.value } }));

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const body = {
                title: form.title,
                startDateTime: new Date(form.startDateTime).toISOString(),
                durationMinutes: Number(form.durationMinutes),
                dynamicCriteria: { ...form.dynamicCriteria, count: Number(form.dynamicCriteria.count), label: 'basic' }
            };
            const res = await api.createSelfExam(body);
            const examId = res.data._id;

            // Fix #16 - auto-add creator as participant
            await api.allowParticipant({ examId, userId: user.id });

            toast('Self-exam created!');
            setCreated(res.data);
        } catch (e) {
            toast(e.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const addFriends = async () => {
        if (!selectedFriends.length) return;
        setAdding(true);
        try {
            await Promise.all(selectedFriends.map(userId =>
                api.allowParticipant({ examId: created._id, userId })
            ));
            toast(`${selectedFriends.length} friend(s) added!`);
            setSelectedFriends([]);
        } catch (e) { toast(e.message, 'error'); }
        finally { setAdding(false); }
    };

    // Copy own ID helper for sharing
    const copyMyId = () => {
        navigator.clipboard.writeText(user.id);
        toast('Your User ID copied!');
    };
    const canTake = created && new Date() >= new Date(created.startDateTime);
    if (created) return (
        <div className="page" style={{ maxWidth: 540 }}>
            <div className="page-header"><h1>Exam Created!</h1></div>
            <div className="card" style={{ marginBottom: 16 }}>
                <div className="alert alert-success" style={{ marginBottom: 16 }}>
                    "<strong>{created.title}</strong>" is ready. You've been added automatically.
                </div>

                {/* Fix #9 - share own ID */}
                <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Share your User ID with friends</p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{user?.id}</p>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={copyMyId}>Copy</button>
                </div>

                {/* <div className="form-group">
                    <label>Add a friend by their User ID</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input value={friendId} onChange={e => setFriendId(e.target.value)} placeholder="Friend's User ID" />
                        <button className="btn btn-primary" onClick={addFriend} disabled={adding || !friendId.trim()} style={{ whiteSpace: 'nowrap' }}>
                            {adding ? <span className="spinner" /> : 'Add'}
                        </button>
                    </div>
                    {addedFriends.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                            <label>Added ({addedFriends.length})</label>
                            <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '8px 12px', maxHeight: 100, overflowY: 'auto' }}>
                                {addedFriends.map(id => (
                                    <div key={id} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
                                        {id}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div> */}
                <div className="form-group">
                    <label>Invite Friends</label>
                    <ParticipantPicker selected={selectedFriends} onChange={setSelectedFriends} />
                    <button className="btn btn-primary" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}
                        onClick={addFriends} disabled={adding || !selectedFriends.length}>
                        {adding ? <span className="spinner" /> : `Add (${selectedFriends.length})`}
                    </button>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>

                <button className="btn btn-ghost" onClick={() => nav('/participant')}>← Dashboard</button>
                <button
                    className="btn btn-primary"
                    onClick={() => nav(`/participant/exam/${created._id}`)}
                    disabled={!canTake}
                    title={!canTake ? `Starts at ${new Date(created.startDateTime).toLocaleString()}` : ''}
                >
                    {canTake ? 'Take Exam Now →' : `Starts at ${new Date(created.startDateTime).toLocaleTimeString()}`}
                </button>
            </div>
        </div>
    );

    return (
        <div className="page">
            <div className="page-header">
                <h1>Create Self-Exam</h1>
                <button className="btn btn-ghost" onClick={() => nav('/participant')}>← Back</button>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
                <div className="alert alert-success" style={{ marginBottom: 0 }}>
                    Self-exams are always <strong>Basic</strong> level. You'll be added as a participant automatically.
                </div>
            </div>

            <form onSubmit={submit}>
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="form-group">
                        <label>Exam Title</label>
                        <input value={form.title} onChange={set('title')} required placeholder="e.g. My Practice Quiz" />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Date & Time</label>
                            <input type="datetime-local" value={form.startDateTime} min={nowPlus10Min()} onChange={set('startDateTime')} required />
                            {form.startDateTime && (
                                <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>
                                    ✅ {new Date(form.startDateTime).toLocaleString()}
                                </p>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Duration (minutes)</label>
                            <input type="number" value={form.durationMinutes} onChange={set('durationMinutes')} min={5} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Subject</label>
                            <select value={form.dynamicCriteria.subject} onChange={setCriteria('subject')}>
                                <option value="">Any</option>
                                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Topic</label>
                            <select value={form.dynamicCriteria.topic} onChange={setCriteria('topic')}>
                                <option value="">Any</option>
                                {topics.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group" style={{ maxWidth: 200 }}>
                        <label>Number of Questions</label>
                        <input type="number" value={form.dynamicCriteria.count} onChange={setCriteria('count')} min={1} required />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => nav('/participant')}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? <span className="spinner" /> : 'Create Exam'}
                    </button>
                </div>
            </form>
        </div>
    );
}