import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { Spinner, Empty } from '../../components';
import * as api from '../../api';

export default function ExamResults() {
    const { id } = useParams();
    const nav = useNavigate();
    const { data: results, loading } = useFetch(() => api.getExamResults(id), [id]);

    const maxScore = results?.[0]?.score || 1;

    return (
        <div className="page">
            <div className="page-header">
                <h1>Exam Results</h1>
                <button className="btn btn-ghost" onClick={() => nav('/setter')}>← Back</button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                {loading ? <Spinner /> : !results?.length ? (
                    <Empty title="No submissions yet" message="Results will appear once participants submit." />
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr><th>#</th><th>Name</th><th>Email</th><th>Score</th><th>Submitted</th></tr>
                            </thead>
                            <tbody>
                                {results.map((r) => (
                                    <tr key={r.userId} className={r.rank === 1 ? 'rank-1' : ''}>
                                        <td style={{ fontFamily: 'var(--font-mono)', color: r.rank === 1 ? 'var(--accent)' : 'var(--muted)' }}>
                                            {r.rank === 1 ? '🥇' : `#${r.rank}`}
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{r.name}</td>
                                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{r.email}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{r.score}</span>
                                                <div className="score-bar-wrap">
                                                    <div className="score-bar" style={{ width: `${(r.score / maxScore) * 100}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>
                                            {new Date(r.submittedAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}