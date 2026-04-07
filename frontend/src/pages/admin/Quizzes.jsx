import { useState, useEffect } from 'react';
import * as api from '../../api';
import { Spinner, Empty, Modal, LabelBadge, ErrorMessage } from '../../components';
import { useToast } from '../../context/ToastContext';

const EMPTY_FORM = {
    subjectName: '', topicName: '', questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '', label: 'basic'
};

export default function AdminQuizzes() {
    const toast = useToast();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ subject: '', topic: '', label: '', search: '' });
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);



    const hasFilters = filters.subject || filters.topic || filters.label || filters.search;

    const loadQuizzes = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (filters.subject) params.subject = filters.subject;
            if (filters.topic) params.topic = filters.topic;
            if (filters.label) params.label = filters.label;
            const res = await api.getQuizzes(params);
            setQuizzes(res.data);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    useEffect(() => setPage(1), [filters]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadQuizzes(); }, [filters.subject, filters.topic, filters.label]);
    useEffect(() => { api.getSubjects().then(r => setSubjects(r.data)).catch(() => { }); }, []);
    useEffect(() => {
        api.getTopics(filters.subject).then(r => setTopics(r.data)).catch(() => { });
    }, [filters.subject]);

    const clearFilters = () => setFilters({ subject: '', topic: '', label: '', search: '' });

    // Fix #15 - client-side keyword search filter
    const displayed = filters.search
        ? quizzes.filter(q =>
            q.questionText.toLowerCase().includes(filters.search.toLowerCase()) ||
            q.subjectName.toLowerCase().includes(filters.search.toLowerCase()) ||
            q.topicName.toLowerCase().includes(filters.search.toLowerCase())
        )
        : quizzes;

    const [page, setPage] = useState(1);
    const PER_PAGE = 15;
    const paginated = displayed.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const totalPages = Math.ceil(displayed.length / PER_PAGE);


    const openCreate = () => { setForm(EMPTY_FORM); setModal('create'); };
    const openEdit = (q) => {
        setForm({ subjectName: q.subjectName, topicName: q.topicName, questionText: q.questionText, options: [...q.options], correctAnswer: q.correctAnswer, label: q.label });
        setModal(q);
    };

    const setOpt = (i, v) => setForm(f => {
        const options = [...f.options]; options[i] = v; return { ...f, options };
    });

    const save = async () => {
        setSaving(true);
        try {
            if (modal === 'create') { await api.createQuiz(form); toast('Quiz created'); }
            else { await api.updateQuiz(modal._id, form); toast('Quiz updated'); }
            setModal(null);
            loadQuizzes();
        } catch (e) { toast(e.message, 'error'); }
        finally { setSaving(false); }
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this quiz?')) return;
        try { await api.deleteQuiz(id); toast('Quiz deleted'); loadQuizzes(); }
        catch (e) { toast(e.message, 'error'); }
    };

    const setFilter = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }));

    const handleCSV = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        try {
            const res = await api.uploadQuizCSV(text);
            toast(res.message);
            loadQuizzes();
        } catch (err) { toast(err.message, 'error'); }
        e.target.value = '';
    };

    const downloadTemplate = () => {
        const csv = 'subject,topic,question,option1,option2,option3,option4,correct,label\nMath,Algebra,What is 2+2?,1,2,3,4,4,basic';
        const a = document.createElement('a');
        a.href = 'data:text/csv,' + encodeURIComponent(csv);
        a.download = 'quiz_template.csv';
        a.click();
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Quiz Bank</h1>
                    {/* Fix #15 - results count */}
                    {!loading && <span style={{ fontSize: 13, color: 'var(--muted)' }}>{displayed.length} quiz{displayed.length !== 1 ? 'zes' : ''}</span>}
                </div>
                <button className="btn btn-primary" onClick={openCreate}>+ Add Quiz</button>
                <button className="btn btn-ghost" onClick={downloadTemplate}>⬇ Template</button>
                <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
                    ⬆ Upload CSV
                    <input type="file" accept=".csv" onChange={handleCSV} style={{ display: 'none' }} />
                </label>

            </div>

            <div className="filter-bar">
                {/* Fix #15 - keyword search */}
                <input
                    placeholder="Search questions…"
                    value={filters.search}
                    onChange={setFilter('search')}
                    style={{ minWidth: 180 }}
                />
                <select value={filters.subject} onChange={setFilter('subject')}>
                    <option value="">All subjects</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filters.topic} onChange={setFilter('topic')}>
                    <option value="">All topics</option>
                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={filters.label} onChange={setFilter('label')}>
                    <option value="">All levels</option>
                    <option value="basic">Basic</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                </select>
                {hasFilters && <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear</button>}
            </div>

            <ErrorMessage message={error} />

            <div className="card" style={{ padding: 0 }}>
                {loading ? <Spinner /> : paginated.length === 0 ? (
                    // Fix #10 - clear filters button inside empty state
                    <Empty
                        title="No quizzes found"
                        message={hasFilters ? 'No quizzes match your current filters.' : 'Add your first quiz to get started.'}
                        action={hasFilters ? <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear filters</button> : null}
                    />
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr><th>Subject</th><th>Topic</th><th>Question</th><th>Level</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {paginated.map(q => (
                                    <tr key={q._id}>
                                        <td>{q.subjectName}</td>
                                        <td>{q.topicName}</td>
                                        <td style={{ maxWidth: 300 }}>{q.questionText.slice(0, 60)}{q.questionText.length > 60 ? '…' : ''}</td>
                                        <td><LabelBadge label={q.label} /></td>
                                        <td>
                                            <div className="td-actions">
                                                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(q)}>Edit</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => remove(q._id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: 16 }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
                                <span style={{ fontSize: 13, color: 'var(--muted)' }}>{page} / {totalPages}</span>
                                <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next →</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {modal && (
                <Modal
                    title={modal === 'create' ? 'Add Quiz' : 'Edit Quiz'}
                    onClose={() => setModal(null)}
                    footer={<>
                        <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                        <button className="btn btn-primary" onClick={save} disabled={saving}>
                            {saving ? <span className="spinner" /> : 'Save'}
                        </button>
                    </>}
                >
                    <div className="form-row">
                        <div className="form-group">
                            <label>Subject</label>
                            <input value={form.subjectName} onChange={e => setForm(f => ({ ...f, subjectName: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label>Topic</label>
                            <input value={form.topicName} onChange={e => setForm(f => ({ ...f, topicName: e.target.value }))} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Question</label>
                        <textarea
                            rows={3}
                            value={form.questionText}
                            onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))}
                            maxLength={300}
                            style={{ resize: 'vertical' }}
                            required
                        />
                        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>
                            {form.questionText.length}/300
                        </p>
                    </div>
                    <div className="form-group">
                        <label>Options</label>
                        {form.options.map((opt, i) => (
                            <input key={i} style={{ marginBottom: 8 }} placeholder={`Option ${i + 1}`} value={opt} onChange={e => setOpt(i, e.target.value)} required />
                        ))}
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Correct Answer</label>
                            <select value={form.correctAnswer} onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))} required>
                                <option value="">Select correct option</option>
                                {form.options.filter(Boolean).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Level</label>
                            <select value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}>
                                <option value="basic">Basic</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}