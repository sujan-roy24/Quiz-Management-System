import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components';

const nowPlus10Min = () => new Date(Date.now() + 10 * 60000).toISOString().slice(0, 16);
const minDatetime  = () => new Date(Date.now() + 60000).toISOString().slice(0, 16);

export default function CreateExam() {
    const nav   = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState({
        title: '',
        quizSelectionType: 'dynamic',
        startDateTime: nowPlus10Min(),
        durationMinutes: 30,
        dynamicCriteria: { subjects: [], topic: '', label: '', count: 10 },
        selectedQuizIds: []
    });

    const [dateError,  setDateError]  = useState('');
    const [saving,     setSaving]     = useState(false);

    // Shared data
    const [subjects,   setSubjects]   = useState([]);
    const [topics,     setTopics]     = useState([]);

    // Manual selection state
    const [quizzes,    setQuizzes]    = useState([]);
    const [quizLoad,   setQuizLoad]   = useState(false);
    const [manualFilter, setManualFilter] = useState({ subject: '', topic: '', label: '', search: '' });
    const [manualTopics, setManualTopics] = useState([]);

    // Dynamic match count
    const [matchCount, setMatchCount] = useState(null);

    // Load all subjects once
    useEffect(() => {
        api.getSubjects().then(r => setSubjects(r.data)).catch(() => {});
    }, []);

    // Dynamic: load topics when subjects change
    useEffect(() => {
        const { subjects: sel } = form.dynamicCriteria;
        if (sel.length === 1) {
            api.getTopics(sel[0]).then(r => setTopics(r.data)).catch(() => {});
        } else {
            setTopics([]);
            setForm(f => ({ ...f, dynamicCriteria: { ...f.dynamicCriteria, topic: '' } }));
        }
    }, [form.dynamicCriteria.subjects]);

    // Dynamic: update match count when criteria change
    useEffect(() => {
        if (form.quizSelectionType !== 'dynamic') return;
        const { subjects: sel, topic, label } = form.dynamicCriteria;
        const params = {};
        if (sel.length)  params.subjects = sel.join(',');
        if (topic)       params.topic    = topic;
        if (label)       params.label    = label;
        api.getMatchCount(params).then(r => setMatchCount(r.data)).catch(() => {});
    }, [form.dynamicCriteria, form.quizSelectionType]);

    // Manual: load quizzes when type switches
    useEffect(() => {
        if (form.quizSelectionType !== 'manual') return;
        setQuizLoad(true);
        const params = {};
        if (manualFilter.subject) params.subject = manualFilter.subject;
        if (manualFilter.topic)   params.topic   = manualFilter.topic;
        if (manualFilter.label)   params.label   = manualFilter.label;
        api.getQuizzes(params)
            .then(r => setQuizzes(r.data))
            .catch(() => setQuizzes([]))
            .finally(() => setQuizLoad(false));
    }, [form.quizSelectionType, manualFilter.subject, manualFilter.topic, manualFilter.label]);

    // Manual: load topics when subject filter changes
    useEffect(() => {
        if (manualFilter.subject)
            api.getTopics(manualFilter.subject).then(r => setManualTopics(r.data)).catch(() => {});
        else
            setManualTopics([]);
    }, [manualFilter.subject]);

    const set = (k) => (e) => {
        setForm(f => ({ ...f, [k]: e.target.value }));
        if (k === 'startDateTime')
            setDateError(new Date(e.target.value) <= new Date() ? 'Start time must be in the future.' : '');
    };

    const setCriteria = (k) => (e) =>
        setForm(f => ({ ...f, dynamicCriteria: { ...f.dynamicCriteria, [k]: e.target.value } }));

    // Toggle subject in multi-select
    const toggleSubject = (s) => {
        const cur = form.dynamicCriteria.subjects;
        const next = cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s];
        setForm(f => ({ ...f, dynamicCriteria: { ...f.dynamicCriteria, subjects: next, topic: '' } }));
    };

    // Toggle quiz in manual selection
    const toggleQuiz = (id) => setForm(f => ({
        ...f,
        selectedQuizIds: f.selectedQuizIds.includes(id)
            ? f.selectedQuizIds.filter(x => x !== id)
            : [...f.selectedQuizIds, id]
    }));

    // Manual: client-side search filter
    const displayedQuizzes = manualFilter.search
        ? quizzes.filter(q => q.questionText.toLowerCase().includes(manualFilter.search.toLowerCase()))
        : quizzes;

    const submit = async (e) => {
        e.preventDefault();
        if (new Date(form.startDateTime) <= new Date()) {
            setDateError('Start time must be in the future.');
            return;
        }
        setSaving(true);
        try {
            const body = {
                title:            form.title,
                quizSelectionType: form.quizSelectionType,
                startDateTime:    new Date(form.startDateTime).toISOString(),
                durationMinutes:  Number(form.durationMinutes),
                ...(form.quizSelectionType === 'dynamic'
                    ? { dynamicCriteria: { ...form.dynamicCriteria, count: Number(form.dynamicCriteria.count) } }
                    : { selectedQuizIds: form.selectedQuizIds })
            };
            await api.createExam(body);
            toast('Exam created successfully');
            nav('/setter');
        } catch (err) {
            toast(err.message, 'error');
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
                {/* Basic Info */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="form-group">
                        <label>Exam Title</label>
                        <input value={form.title} onChange={set('title')} maxLength={80} required placeholder="e.g. Math Mid-Term" />
                        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>{form.title.length}/80</p>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Date & Time</label>
                            <input type="datetime-local" value={form.startDateTime} min={minDatetime()} onChange={set('startDateTime')} required />
                            {form.startDateTime && !dateError && (
                                <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>✅ {new Date(form.startDateTime).toLocaleString()}</p>
                            )}
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

                {/* Dynamic Selection */}
                {form.quizSelectionType === 'dynamic' && (
                    <div className="card" style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                            System randomly picks questions matching your criteria.
                        </p>

                        {/* Subject multi-select */}
                        <div className="form-group">
                            <label>
                                Subjects
                                <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 6 }}>
                                    {form.dynamicCriteria.subjects.length === 0 ? '(Any)' : `${form.dynamicCriteria.subjects.length} selected`}
                                </span>
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {subjects.map(s => (
                                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer',
                                        padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 20,
                                        background: form.dynamicCriteria.subjects.includes(s) ? 'rgba(245,166,35,0.15)' : 'transparent',
                                        color: form.dynamicCriteria.subjects.includes(s) ? 'var(--accent)' : 'var(--muted)',
                                        borderColor: form.dynamicCriteria.subjects.includes(s) ? 'var(--accent)' : 'var(--border)'
                                    }}>
                                        <input type="checkbox" checked={form.dynamicCriteria.subjects.includes(s)}
                                            onChange={() => toggleSubject(s)} style={{ display: 'none' }} />
                                        {s}
                                    </label>
                                ))}
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                                Leave all unchecked for any subject
                            </p>
                        </div>

                        {/* Topic — only show if exactly one subject selected */}
                        <div className="form-row">
                            <div className="form-group">
                                <label>Topic</label>
                                <select value={form.dynamicCriteria.topic} onChange={setCriteria('topic')}
                                    disabled={form.dynamicCriteria.subjects.length !== 1}>
                                    <option value="">Any topic</option>
                                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                {form.dynamicCriteria.subjects.length !== 1 && (
                                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                                        Select exactly one subject to filter by topic
                                    </p>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Level</label>
                                <select value={form.dynamicCriteria.label} onChange={setCriteria('label')}>
                                    <option value="">Any level</option>
                                    <option value="basic">Basic</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group" style={{ maxWidth: 200 }}>
                            <label>Number of Questions</label>
                            <input type="number" value={form.dynamicCriteria.count} onChange={setCriteria('count')} min={1} required />
                        </div>

                        {/* Live match count */}
                        {matchCount !== null && (
                            <div style={{ fontSize: 13, padding: '8px 12px', borderRadius: 'var(--radius)',
                                background: matchCount >= form.dynamicCriteria.count ? 'rgba(76,175,130,0.1)' : 'rgba(224,82,82,0.1)',
                                color: matchCount >= form.dynamicCriteria.count ? 'var(--success)' : 'var(--danger)',
                                border: `1px solid ${matchCount >= form.dynamicCriteria.count ? 'var(--success)' : 'var(--danger)'}` }}>
                                {matchCount >= form.dynamicCriteria.count
                                    ? `✅ ${matchCount} quizzes match — enough to pick ${form.dynamicCriteria.count}`
                                    : `⚠️ Only ${matchCount} quizzes match — need at least ${form.dynamicCriteria.count}`}
                            </div>
                        )}
                    </div>
                )}

                {/* Manual Selection */}
                {form.quizSelectionType === 'manual' && (
                    <div className="card" style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                            Selected: <strong style={{ color: 'var(--accent)' }}>{form.selectedQuizIds.length}</strong> quizzes
                        </p>

                        {/* Filters */}
                        <div className="filter-bar" style={{ marginBottom: 12 }}>
                            <input placeholder="Search questions…" value={manualFilter.search}
                                onChange={e => setManualFilter(f => ({ ...f, search: e.target.value }))}
                                style={{ minWidth: 160 }} />
                            <select value={manualFilter.subject}
                                onChange={e => setManualFilter(f => ({ ...f, subject: e.target.value, topic: '' }))}>
                                <option value="">All subjects</option>
                                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select value={manualFilter.topic}
                                onChange={e => setManualFilter(f => ({ ...f, topic: e.target.value }))}>
                                <option value="">All topics</option>
                                {manualTopics.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select value={manualFilter.label}
                                onChange={e => setManualFilter(f => ({ ...f, label: e.target.value }))}>
                                <option value="">All levels</option>
                                <option value="basic">Basic</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>

                        {/* Quiz checklist */}
                        {quizLoad ? <Spinner /> : displayedQuizzes.length === 0 ? (
                            <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: 20 }}>
                                No quizzes found
                            </p>
                        ) : (
                            <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {displayedQuizzes.map(q => (
                                    <label key={q._id} className="option-label" style={{ cursor: 'pointer',
                                        background: form.selectedQuizIds.includes(q._id) ? 'rgba(245,166,35,0.07)' : 'transparent',
                                        borderColor: form.selectedQuizIds.includes(q._id) ? 'var(--accent)' : 'var(--border)' }}>
                                        <input type="checkbox" checked={form.selectedQuizIds.includes(q._id)}
                                            onChange={() => toggleQuiz(q._id)}
                                            style={{ accentColor: 'var(--accent)', width: 15, height: 15, flexShrink: 0 }} />
                                        <span style={{ flex: 1, fontSize: 13 }}>{q.questionText.slice(0, 90)}{q.questionText.length > 90 ? '…' : ''}</span>
                                        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{q.subjectName}</span>
                                        <span className={`badge badge-${q.label}`}>{q.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
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