import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../api';
import { useToast } from '../../context/ToastContext';

const nowPlus1Min = () => new Date(Date.now() + 60000).toISOString().slice(0, 16);
// Fix #14 - minimum allowed datetime for the input
const minDatetime = () => new Date(Date.now() + 60000).toISOString().slice(0, 16);

export default function CreateExam() {
    const nav = useNavigate();
    const toast = useToast();
    const [form, setForm] = useState({
        title: '', quizSelectionType: 'dynamic',
        startDateTime: nowPlus1Min(), durationMinutes: 30,
        dynamicCriteria: { subject: '', topic: '', label: 'basic', count: 10 },
        selectedQuizIds: []
    });
    const [dateError, setDateError] = useState(''); // Fix #14
    const [quizzes, setQuizzes] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => { api.getSubjects().then(r => setSubjects(r.data)).catch(() => { }); }, []);
    useEffect(() => {
        if (form.dynamicCriteria.subject)
            api.getTopics(form.dynamicCriteria.subject).then(r => setTopics(r.data)).catch(() => { });
    }, [form.dynamicCriteria.subject]);
    useEffect(() => {
        if (form.quizSelectionType === 'manual')
            api.getQuizzes().then(r => setQuizzes(r.data)).catch(() => { });
    }, [form.quizSelectionType]);

    const set = (k) => (e) => {
        setForm(f => ({ ...f, [k]: e.target.value }));
        // Fix #14 - inline date validation
        if (k === 'startDateTime') {
            setDateError(new Date(e.target.value) <= new Date() ? 'Start time must be in the future.' : '');
        }
    };
    const setCriteria = (k) => (e) => setForm(f => ({ ...f, dynamicCriteria: { ...f.dynamicCriteria, [k]: e.target.value } }));

    const toggleQuiz = (id) => setForm(f => ({
        ...f,
        selectedQuizIds: f.selectedQuizIds.includes(id)
            ? f.selectedQuizIds.filter(x => x !== id)
            : [...f.selectedQuizIds, id]
    }));

    const submit = async (e) => {
        e.preventDefault();
        // Fix #14 - block submission if date is invalid
        if (new Date(form.startDateTime) <= new Date()) {
            setDateError('Start time must be in the future.');
            return;
        }
        setSaving(true);
        try {
            const body = {
                title: form.title,
                quizSelectionType: form.quizSelectionType,
                startDateTime: new Date(form.startDateTime).toISOString(),
                durationMinutes: Number(form.durationMinutes),
                ...(form.quizSelectionType === 'dynamic'
                    ? { dynamicCriteria: { ...form.dynamicCriteria, count: Number(form.dynamicCriteria.count) } }
                    : { selectedQuizIds: form.selectedQuizIds })
            };
            await api.createExam(body);
            toast('Exam created successfully');
            nav('/setter');
        } catch (e) {
            toast(e.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>Create Exam</h1>
                <button className="btn btn-ghost" onClick={() => nav('/setter')}>← Back</button>
            </div>

            <form onSubmit={submit}>
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="form-group">
                        <label>Exam Title</label>
                        <input
                            value={form.title}
                            onChange={set('title')}
                            maxLength={80}
                            required
                            placeholder="e.g. Math Mid-Term"
                        />
                        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>
                            {form.title.length}/80
                        </p>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Date & Time</label>
                            <input
                                type="datetime-local"
                                value={form.startDateTime}
                                min={minDatetime()}
                                onChange={set('startDateTime')}
                                required
                            />
                            {/* Fix #14 - inline error */}
                            {dateError && <p className="form-error">{dateError}</p>}
                        </div>
                        <div className="form-group">
                            <label>Duration (minutes)</label>
                            <input type="number" value={form.durationMinutes} onChange={set('durationMinutes')} min={5} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Selection Type</label>
                        <select value={form.quizSelectionType} onChange={set('quizSelectionType')}>
                            <option value="dynamic">Dynamic (auto-select)</option>
                            <option value="manual">Manual (pick quizzes)</option>
                        </select>
                    </div>
                </div>

                {form.quizSelectionType === 'dynamic' ? (
                    <div className="card" style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>System will randomly select quizzes matching your criteria.</p>
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
                        <div className="form-row">
                            <div className="form-group">
                                <label>Level</label>
                                <select value={form.dynamicCriteria.label} onChange={setCriteria('label')}>
                                    <option value="basic">Basic</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Number of Questions</label>
                                <input type="number" value={form.dynamicCriteria.count} onChange={setCriteria('count')} min={1} required />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                            Selected: <strong style={{ color: 'var(--accent)' }}>{form.selectedQuizIds.length}</strong> quizzes
                        </p>
                        <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {quizzes.map(q => (
                                <label key={q._id} className="option-label" style={{ cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.selectedQuizIds.includes(q._id)} onChange={() => toggleQuiz(q._id)} style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
                                    <span style={{ flex: 1, fontSize: 13 }}>{q.questionText.slice(0, 80)}</span>
                                    <span className={`badge badge-${q.label}`}>{q.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => nav('/setter')}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving || !!dateError}>
                        {saving ? <span className="spinner" /> : 'Create Exam'}
                    </button>
                </div>
            </form>
        </div>
    );
}