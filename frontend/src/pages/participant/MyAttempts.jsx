import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { Spinner, Empty, ErrorMessage } from '../../components';
import * as api from '../../api';

export default function MyAttempts() {
    const nav = useNavigate();

    const { data: attempts, loading, error } = useFetch(api.getMyAttempts);

    return (
        <div className="page">
            <div className="page-header">
                <h1>My Attempts</h1>
                <button className="btn btn-ghost" onClick={() => nav('/participant')}>← Back</button>
            </div>

            <ErrorMessage message={error} />

            <div className="card" style={{ padding: 0 }}>
                {loading ? <Spinner /> : !attempts?.length ? (
                    <Empty title="No attempts yet" message="Complete an exam to see your results here." />
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr><th>Exam</th><th>Score</th><th>Submitted</th><th>Result</th></tr>
                            </thead>
                            <tbody>
                                {attempts.map((a, i) => {
                                    const total = a.answers?.length;
                                    return (
                                        <tr key={a._id}>
                                            <td style={{ fontWeight: 500 }}>{a.exam?.title || '—'}</td>
                                            <td>
                                                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: 15 }}>
                                                    {a.score}{total ? ` / ${total}` : ''}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--muted)', fontSize: 13 }}>
                                                {new Date(a.submittedAt).toLocaleString()}
                                            </td>
                                            <td>
                                                {i === 0 && sessionStorage.getItem('lastResult') && (
                                                    <button className="btn btn-ghost btn-sm" onClick={() => nav('/participant/result')}>
                                                        View Result
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}