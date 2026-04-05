import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../../api';
import { Spinner } from '../../components';
import { useToast } from '../../context/ToastContext';

export default function TakeExam() {
    const { id } = useParams();
    const nav = useNavigate();
    const toast = useToast();
    const submitted = useRef(false);

    const [examData, setExamData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);



    useEffect(() => {
        const load = async () => {
            try {
                // Fix #6 - check if already attempted before loading questions
                const attemptsRes = await api.getMyAttempts();
                const alreadyDone = attemptsRes.data?.some(a => a.exam?._id === id);
                if (alreadyDone) {
                    toast('You have already attempted this exam.', 'error');
                    nav('/participant');
                    return;
                }
                const res = await api.getExamQuestions(id);
                setExamData(res.data.exam);
                setQuestions(res.data.questions);
                const end = new Date(res.data.exam.endDateTime).getTime();
                setTimeLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
            } catch (e) {
                toast(e.message, 'error');
                nav('/participant');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    // Fix #7 - navigate to result screen with score data
    // const submit = useCallback(async (auto = false) => {
    //     if (submitted.current) return;
    //     submitted.current = true;
    //     if (!auto && !window.confirm('Submit exam? You cannot change answers after submission.')) {
    //         submitted.current = false;
    //         return;
    //     }
    //     setSubmitting(true);
    //     try {
    //         const ans = questions.map(q => ({ quizId: q._id, selectedOption: answers[q._id] || '' }));
    //         const res = await api.submitAttempt({ examId: id, answers: ans });
    //         nav('/participant/result', {
    //             state: { score: res.data.score, total: questions.length, title: examData?.title }
    //         });
    //     } catch (e) {
    //         toast(e.message, 'error');
    //         submitted.current = false;
    //     } finally {
    //         setSubmitting(false);
    //     }
    // }, [answers, questions, id, nav, examData]);

    const submit = useCallback(async (auto = false) => {
        if (submitted.current) return;
        submitted.current = true;

        if (!auto && !window.confirm('Submit exam? You cannot change answers after submission.')) {
            submitted.current = false;
            return;
        }

        setSubmitting(true);
        try {
            const ans = questions.map(q => ({
                quizId: q._id,
                selectedOption: answers[q._id] || ''
            }));

            const res = await api.submitAttempt({ examId: id, answers: ans });

            const resultData = {
                score: res.data.score,
                total: questions.length,
                title: examData?.title
            };

            sessionStorage.setItem('lastResult', JSON.stringify({
                score: res.data.score,
                total: questions.length,
                title: examData?.title
            }));
            nav('/participant/result', { state: { score: res.data.score, total: questions.length, title: examData?.title } });

        } catch (e) {
            toast(e.message, 'error');
            submitted.current = false;
        } finally {
            setSubmitting(false);
        }
    }, [answers, questions, id, nav, examData]);

    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) { submit(true); return; }
        const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, submit]);

    // Warn before tab close / navigate away
    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, []);

    const fmt = (s) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    const answered = Object.keys(answers).filter(k => answers[k]).length;
    const total = questions.length;

    // Fix #13 - progress percentage
    const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

    if (loading) return <div className="page"><Spinner /></div>;

    return (
        <div className="page">
            {/* Sticky exam header */}
            <div style={{ position: 'sticky', top: 58, zIndex: 90, background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '12px 0', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                        <h1 style={{ fontSize: 20 }}>{examData?.title}</h1>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{answered} of {total} answered</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span className={`timer${timeLeft !== null && timeLeft < 300 ? ' danger' : ''}`}>
                            {timeLeft !== null ? fmt(timeLeft) : '--:--'}
                        </span>
                        <button className="btn btn-primary" onClick={() => submit(false)} disabled={submitting}>
                            {submitting ? <span className="spinner" /> : 'Submit'}
                        </button>
                    </div>
                </div>
                {/* Fix #13 - progress bar */}
                <div style={{ background: 'var(--border)', borderRadius: 4, height: 4 }}>
                    <div style={{ background: 'var(--accent)', height: 4, borderRadius: 4, width: `${progress}%`, transition: 'width 0.3s' }} />
                </div>
            </div>

            {questions.map((q, i) => (
                <div key={q._id} className="question-card">
                    <div className="question-num">Question {i + 1} of {total}</div>
                    <div className="question-text">{q.questionText}</div>
                    <div>
                        {q.options.map((opt, j) => (
                            <label key={j} className={`option-label${answers[q._id] === opt ? ' selected' : ''}`}>
                                <input
                                    type="radio"
                                    name={q._id}
                                    value={opt}
                                    checked={answers[q._id] === opt}
                                    onChange={() => setAnswers(a => ({ ...a, [q._id]: opt }))}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, marginBottom: 40 }}>
                <button className="btn btn-primary" onClick={() => submit(false)} disabled={submitting}>
                    {submitting ? <span className="spinner" /> : 'Submit Exam'}
                </button>
            </div>
        </div>
    );
}