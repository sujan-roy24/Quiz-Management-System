import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { Spinner, Empty, StatusBadge, ErrorMessage } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as api from '../../api';

const getTimeLeft = (startDateTime, durationMinutes) => {
    const end = new Date(startDateTime).getTime() + durationMinutes * 60000;
    return Math.max(0, Math.floor((end - Date.now()) / 60000));
};

export default function AvailableExams() {
    const nav = useNavigate();
    const toast = useToast();
    const { user } = useAuth();

    const { data: exams, loading, error } = useFetch(api.getAvailableExams);
    const { data: upcoming } = useFetch(api.getUpcomingExams);

    // Fix #9 - copy user ID to clipboard
    const copyId = async () => {
        try {
            await navigator.clipboard.writeText(user?.id || '');
            toast('Your User ID copied to clipboard!');
        } catch (e) {
            toast('Failed to copy ID', 'error');
        }
    };

    const fmt = (d) => new Date(d).toLocaleString();



    return (
        <div className="page">
            <div className="page-header">
                <h1>Available Exams</h1>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={() => nav('/participant/self-exam')}>+ Self Exam</button>
                </div>
            </div>

            {/* Fix #9 - user ID banner so participant can share it */}
            <div className="card card-sm" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                    <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Your User ID</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{user?.id}</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={copyId}>Copy ID</button>
            </div>

            <ErrorMessage message={error} />

            {loading ? <Spinner /> : !exams?.length ? (
                <Empty title="No exams available" message="You haven't been added to any active exams yet." />
            ) : (
                <div className="exam-grid">
                    {exams.map(ex => {

                        const start = new Date(ex.startDateTime);
                        const end = new Date(start.getTime() + ex.durationMinutes * 60000);

                        return (
                            <div key={ex._id} className="exam-card">
                                <div>
                                    <div style={{ marginBottom: 6 }}><StatusBadge status={ex.status} /></div>
                                    <div className="exam-card-title">{ex.title}</div>
                                    <div className="exam-card-meta" style={{ marginTop: 4 }}>by {ex.createdBy?.name}</div>
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <span>Starts: {fmt(ex.startDateTime)}</span>
                                    <span>Ends: {fmt(end)}</span>
                                    <span>Duration: {ex.durationMinutes} minutes</span>
                                </div>

                                {ex.status === 'ongoing' && (
                                    <span style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                                        ⏱ {getTimeLeft(ex.startDateTime, ex.durationMinutes)} min left
                                    </span>
                                )}
                                <div className="exam-card-footer">
                                    <button className="btn btn-primary btn-sm" onClick={() => nav(`/participant/exam/${ex._id}`)}>
                                        Start Exam →
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {upcoming?.length > 0 && (
                <div style={{ marginTop: 32 }}>
                    <h2 style={{ fontSize: 18, marginBottom: 16 }}>Upcoming Exams</h2>
                    <div className="exam-grid">
                        {upcoming.map(ex => (
                            <div key={ex._id} className="exam-card">
                                <div>
                                    <div style={{ marginBottom: 6 }}><StatusBadge status="upcoming" /></div>
                                    <div className="exam-card-title">{ex.title}</div>
                                    <div className="exam-card-meta">by {ex.createdBy?.name}</div>
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                                    Starts: {new Date(ex.startDateTime).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}