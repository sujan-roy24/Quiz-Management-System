import { useFetch } from '../../hooks/useFetch';
import { Spinner } from '../../components';
import * as api from '../../api';

const StatCard = ({ label, value, sub }) => (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', flex: 1, minWidth: 180 }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: 36, fontFamily: 'var(--font-head)', fontWeight: 800, color: 'var(--accent)', marginBottom: 6 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sub}</div>
    </div>
);

export default function Overview() {
    const { data: stats, loading } = useFetch(api.getStats);
    if (loading) return <Spinner />;
    if (!stats) return null;

    return (
        <div>
            <h1 style={{ fontSize: 24, marginBottom: 24 }}>Overview</h1>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
                <StatCard label="Total Users" value={stats.users.total}
                    sub={`${stats.users.admin} admin · ${stats.users.setter} setter · ${stats.users.participant} participant`} />
                <StatCard label="Total Quizzes" value={stats.quizzes.total}
                    sub={`${stats.quizzes.basic} basic · ${stats.quizzes.intermediate} intermediate · ${stats.quizzes.advanced} advanced`} />
                <StatCard label="Total Exams" value={stats.exams.total}
                    sub={`${stats.exams.upcoming} upcoming · ${stats.exams.ongoing} ongoing · ${stats.exams.completed} completed`} />
                <StatCard label="Total Attempts" value={stats.attempts} sub="all time submissions" />
            </div>
        </div>
    );
}