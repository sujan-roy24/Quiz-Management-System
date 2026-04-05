import { useLocation, useNavigate, Navigate } from 'react-router-dom';

export default function ExamResult() {
    const { state } = useLocation();
    const nav = useNavigate();

    // If landed here without state, redirect away
     const result = state || JSON.parse(sessionStorage.getItem('lastResult') || 'null');

    // If no result at all, redirect away
    if (!result) return <Navigate to="/participant" replace />;

    const { score, total, title } = result;
    
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const color = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--accent)' : 'var(--danger)';
    const msg = pct >= 70 ? 'Great job!' : pct >= 40 ? 'Good effort!' : 'Keep practising!';

    return (
        <div className="page" style={{ maxWidth: 500, textAlign: 'center', paddingTop: 60 }}>
            <div className="card">
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>{title}</p>
                <div style={{ fontSize: 72, fontFamily: 'var(--font-head)', fontWeight: 800, color, lineHeight: 1 }}>
                    {pct}%
                </div>
                <p style={{ fontSize: 18, marginTop: 10, marginBottom: 4 }}>{msg}</p>
                <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>
                    You scored <strong style={{ color: 'var(--text)' }}>{score}</strong> out of <strong style={{ color: 'var(--text)' }}>{total}</strong> questions
                </p>

                {/* Score bar */}
                <div style={{ background: 'var(--border)', borderRadius: 8, height: 10, marginBottom: 28 }}>
                    <div style={{ background: color, height: 10, borderRadius: 8, width: `${pct}%`, transition: 'width 0.6s ease' }} />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button className="btn btn-ghost" onClick={() => nav('/participant/attempts')}>View All Attempts</button>
                    <button className="btn btn-primary" onClick={() => nav('/participant')}>Back to Dashboard</button>
                </div>
            </div>
        </div>
    );
}