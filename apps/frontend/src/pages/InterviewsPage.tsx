import React, { useEffect, useState } from 'react';
import { interviewsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function InterviewsPage() {
  const { user } = useAuth();
  const isHR = user?.role === 'hr';
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewsAPI.list().then((res) => setInterviews(res.data.data)).finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    scheduled: 'badge-green',
    completed: 'badge-indigo',
    cancelled: 'badge-red',
    rescheduled: 'badge-yellow',
  };

  const platformIcon: Record<string, string> = {
    google_meet: '🟢',
    zoom: '🔵',
    other: '📹',
    phone: '📞',
    onsite: '🏢',
  };

  const upcoming = interviews.filter((i) => i.status === 'scheduled' && new Date(i.scheduledAt) > new Date());
  const past = interviews.filter((i) => i.status !== 'scheduled' || new Date(i.scheduledAt) <= new Date());

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  function InterviewCard({ iv }: { iv: any }) {
    const isPast = new Date(iv.scheduledAt) < new Date();
    return (
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {/* Date block */}
          <div style={{
            width: 60, height: 60, borderRadius: 12, flexShrink: 0,
            background: isPast ? 'var(--bg)' : 'linear-gradient(135deg, var(--primary-soft), var(--secondary-soft))',
            border: `2px solid ${isPast ? 'var(--border)' : 'var(--primary-light)'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: isPast ? 'var(--text-muted)' : 'var(--primary)', textTransform: 'uppercase' }}>
              {new Date(iv.scheduledAt).toLocaleDateString('en', { month: 'short' })}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: isPast ? 'var(--text-muted)' : 'var(--primary)', lineHeight: 1 }}>
              {new Date(iv.scheduledAt).getDate()}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                  {isHR ? iv.candidate?.name : iv.job?.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {isHR ? iv.job?.title : iv.job?.company} • {new Date(iv.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <span className={`badge ${statusColor[iv.status] || 'badge-gray'}`}>{iv.status}</span>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              <span>{platformIcon[iv.mode]} {iv.mode}</span>
              {iv.platform && <span>{platformIcon[iv.platform]} {iv.platform.replace('_', ' ')}</span>}
              <span>⏱ {iv.duration} min</span>
              {iv.notes && <span>📝 Has notes</span>}
            </div>

            {iv.notes && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                <strong>Notes:</strong> {iv.notes}
              </div>
            )}

            {iv.meetLink && (
              <a href={iv.meetLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ display: 'inline-flex' }}>
                🔗 Join {iv.platform === 'zoom' ? 'Zoom' : 'Google Meet'} Meeting
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <div className="section-title">📅 Interviews</div>
          <div className="section-sub">{interviews.length} total interviews • {upcoming.length} upcoming</div>
        </div>
        {isHR && (
          <button className="btn btn-outline btn-sm" onClick={() => window.location.href = '/applications'}>
            + Schedule from Applications
          </button>
        )}
      </div>

      {interviews.length === 0 ? (
        <div className="empty-state" style={{ padding: 80 }}>
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-text">No interviews yet</div>
          <div className="empty-state-sub">
            {isHR ? 'Shortlist candidates and schedule interviews from the Applications page.' : 'Interviews will appear here once scheduled by HR.'}
          </div>
          <a href={isHR ? '/applications' : '/jobs'} className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 16 }}>
            {isHR ? 'Go to Applications →' : 'Browse Jobs →'}
          </a>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                Upcoming ({upcoming.length})
              </div>
              {upcoming.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                .map((iv) => <InterviewCard key={iv.id} iv={iv} />)}
            </div>
          )}

          {past.length > 0 && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-strong)', display: 'inline-block' }} />
                Past ({past.length})
              </div>
              {past.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
                .map((iv) => <InterviewCard key={iv.id} iv={iv} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
