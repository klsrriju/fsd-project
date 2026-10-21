import React, { useEffect, useState } from 'react';
import { analyticsAPI, interviewsAPI, applicationsAPI, jobsAPI } from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#6366f1', '#7c3aed', '#059669', '#d97706', '#dc2626', '#2563eb', '#ea580c'];

export default function HRDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.get(),
      interviewsAPI.list(),
      applicationsAPI.list(),
    ]).then(([a, i, apps]) => {
      setAnalytics(a.data.data);
      setInterviews(i.data.data.slice(0, 5));
      setRecentApps(apps.data.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const funnel = analytics?.statusFunnel || [];
  const maxFunnel = funnel[0]?.count || 1;

  const funnelColors = ['#6366f1', '#7c3aed', '#059669', '#d97706', '#dc2626'];

  const pieData = [
    { name: 'Applied', value: analytics?.statusBreakdown?.applied || 0 },
    { name: 'Shortlisted', value: analytics?.statusBreakdown?.shortlisted || 0 },
    { name: 'Interviewed', value: analytics?.statusBreakdown?.interview_scheduled || 0 },
    { name: 'Offered', value: analytics?.statusBreakdown?.offered || 0 },
    { name: 'Hired', value: analytics?.statusBreakdown?.hired || 0 },
    { name: 'Rejected', value: analytics?.statusBreakdown?.rejected || 0 },
  ].filter((d) => d.value > 0);

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      applied: 'badge-indigo',
      shortlisted: 'badge-purple',
      interview_scheduled: 'badge-blue',
      interviewed: 'badge-yellow',
      offered: 'badge-orange',
      hired: 'badge-green',
      rejected: 'badge-red',
    };
    return map[status] || 'badge-gray';
  }

  function scoreColor(score: number) {
    if (score >= 80) return 'var(--green)';
    if (score >= 60) return 'var(--yellow)';
    return 'var(--red)';
  }

  return (
    <div className="page">
      {/* Quick Action Navigation for HR */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <a href="/applications" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <span>📋</span> Candidate Pipeline ({analytics?.totalApplications || 0})
        </a>
        <a href="/candidates" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <span>🏆</span> AI Candidate Leaderboard ({analytics?.totalCandidates || 0})
        </a>
        <a href="/interviews" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <span>📅</span> Interviews ({analytics?.upcomingInterviews || 0} upcoming)
        </a>
        <a href="/jobs" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <span>💼</span> Job Postings ({analytics?.activeJobs || 0} active)
        </a>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total Candidates', value: analytics?.totalCandidates || 0, icon: '👥', color: 'indigo', change: `${analytics?.uniqueApplicants || 0} applied`, up: true },
          { label: 'Active Jobs', value: analytics?.activeJobs || 0, icon: '💼', color: 'purple', change: `${analytics?.totalJobs || 0} total`, up: true },
          { label: 'Applications', value: analytics?.totalApplications || 0, icon: '📋', color: 'blue', change: `${analytics?.statusBreakdown?.shortlisted || 0} shortlisted`, up: true },
          { label: 'Interviews', value: analytics?.totalInterviews || 0, icon: '📅', color: 'green', change: `${analytics?.upcomingInterviews || 0} upcoming`, up: true },
          { label: 'Feedback Pending', value: analytics?.pendingFeedbackRequests || 0, icon: '📝', color: 'yellow', change: analytics?.pendingFeedbackRequests ? 'Action needed' : 'All clear', up: !analytics?.pendingFeedbackRequests },
        ].map((s, i) => (
          <div key={i} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</div>
          </div>
        ))}
      </div>

      <div className="two-col" style={{ marginBottom: 24 }}>
        {/* Hiring Funnel */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📊 Hiring Funnel</div>
              <div className="card-subtitle">Candidate progression through stages</div>
            </div>
          </div>
          <div style={{ paddingTop: 8 }}>
            {funnel.map((stage: any, i: number) => (
              <div key={i} className="funnel-bar">
                <div className="funnel-label">{stage.stage}</div>
                <div className="funnel-track">
                  <div
                    className="funnel-fill"
                    style={{
                      width: `${Math.max(5, (stage.count / maxFunnel) * 100)}%`,
                      background: funnelColors[i % funnelColors.length],
                    }}
                  >
                    {stage.count > 0 ? stage.count : ''}
                  </div>
                </div>
                <div className="funnel-count">{stage.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Distribution Pie */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">🥧 Application Status</div>
              <div className="card-subtitle">Current distribution</div>
            </div>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-text">No data yet</div></div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {pieData.map((d: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* Recent Applications with Direct Link to Details */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">🆕 Recent Applications</div>
              <div className="card-subtitle">Click any candidate to open full profile & review pipeline</div>
            </div>
            <a href="/applications" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View all →</a>
          </div>
          <div>
            {recentApps.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">No applications yet</div></div>
            ) : recentApps.map((app: any) => (
              <div
                key={app.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 8px',
                  borderBottom: '1px solid var(--border)',
                  borderRadius: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <div className="avatar avatar-sm">
                    {(app.candidate?.name || 'U')[0]}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <a
                        href={`/applications?appId=${app.id}`}
                        style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', textDecoration: 'none' }}
                      >
                        {app.candidate?.name || 'Unknown Candidate'}
                      </a>
                      <span className={`badge ${statusBadge(app.status)}`} style={{ fontSize: 10 }}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {app.job?.title} • {app.candidate?.targetRole || 'Candidate'}
                      {app.candidate?.phone && ` • 📞 ${app.candidate.phone}`}
                    </div>
                    {app.matchedSkills?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                        {app.matchedSkills.slice(0, 3).map((s: string) => (
                          <span key={s} style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: 'var(--green-soft)', color: 'var(--green)', fontWeight: 600 }}>{s}</span>
                        ))}
                        {app.matchedSkills.length > 3 && (
                          <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>+{app.matchedSkills.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: scoreColor(app.matchScore) }}>
                      {app.matchScore}%
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>match</div>
                  </div>
                  <a
                    href={`/applications?appId=${app.id}`}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: 11, padding: '4px 8px', textDecoration: 'none' }}
                  >
                    View ↗
                  </a>
                  {app.candidate?.phone && (
                    <a
                      href={`https://wa.me/${app.candidate.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${app.candidate.name}, congratulations! Reaching out from TechCorp regarding your application for ${app.job?.title || 'the position'}.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm"
                      style={{ background: '#25D366', color: '#fff', border: 'none', padding: '4px 8px', fontSize: 11, textDecoration: 'none' }}
                      title="Open WhatsApp chat"
                    >
                      💬
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📅 Upcoming Interviews</div>
            <a href="/interviews" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View all →</a>
          </div>
          {interviews.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📅</div><div className="empty-state-text">No interviews scheduled</div></div>
          ) : interviews.map((iv: any) => (
            <div key={iv.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 42, height: 42, borderRadius: 8, background: 'var(--primary-soft)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>
                  {new Date(iv.scheduledAt).toLocaleDateString('en', { month: 'short' }).toUpperCase()}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                  {new Date(iv.scheduledAt).getDate()}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <a
                  href={iv.applicationId ? `/applications?appId=${iv.applicationId}` : '/applications'}
                  style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', textDecoration: 'none' }}
                >
                  {iv.candidate?.name || 'Candidate'}
                </a>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{iv.job?.title} • {iv.mode} • {iv.duration}min</div>
                {iv.meetLink && (
                  <a href={iv.meetLink} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>
                    🔗 Join meeting
                  </a>
                )}
              </div>
              <span className={`badge ${iv.status === 'scheduled' ? 'badge-green' : 'badge-gray'}`}>{iv.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 🌟 Candidate Talent Pool & Live Updates Section */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <div>
            <div className="card-title">🌟 Candidate Talent Pool & Live Profile Updates</div>
            <div className="card-subtitle">Real-time candidate profile changes, newly added skills, verified certificates, and applications</div>
          </div>
          <a href="/candidates" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            View Full Leaderboard →
          </a>
        </div>

        {analytics?.recentCandidateUpdates?.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, paddingTop: 10 }}>
            {analytics.recentCandidateUpdates.map((c: any) => {
              const latestApp = c.applications?.[0];
              return (
                <div
                  key={c.id}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm" style={{ background: 'var(--primary)', color: '#fff', fontWeight: 700 }}>
                          {c.name?.[0] || 'C'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {c.targetRole || 'Candidate'} • {c.yearsOfExperience || 0} yrs exp
                          </div>
                        </div>
                      </div>
                      {latestApp && (
                        <span className={`badge ${statusBadge(latestApp.status)}`} style={{ fontSize: 10 }}>
                          {latestApp.status.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    {c.university && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                        🎓 {c.degree ? `${c.degree} • ` : ''}{c.university}
                      </div>
                    )}

                    {c.phone && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                        📞 {c.phone}
                      </div>
                    )}

                    {/* Verified Credentials / Certificates Badge */}
                    {c.achievementsCount > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 11, background: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                          🏅 {c.achievementsCount} Verified Credential{c.achievementsCount > 1 ? 's' : ''} Uploaded
                        </span>
                      </div>
                    )}

                    {/* Updated Skills Tags */}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                        Current Skills ({c.skills?.length || 0}):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {c.skills?.map((s: string) => (
                          <span key={s} className="badge badge-indigo" style={{ fontSize: 10, padding: '2px 6px' }}>
                            {s}
                          </span>
                        ))}
                        {!c.skills?.length && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>No skills listed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {latestApp ? (
                      <div style={{ fontSize: 12 }}>
                        <span style={{ fontWeight: 700, color: scoreColor(latestApp.matchScore) }}>{latestApp.matchScore}%</span> match
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Not yet applied</div>
                    )}

                    <div style={{ display: 'flex', gap: 6 }}>
                      {latestApp && (
                        <a
                          href={`/applications?appId=${latestApp.id}`}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: 11, padding: '4px 10px', textDecoration: 'none' }}
                        >
                          View Pipeline ↗
                        </a>
                      )}
                      {c.phone && (
                        <a
                          href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${c.name}, reaching out from TechCorp regarding opportunities matching your profile.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm"
                          style={{ background: '#25D366', color: '#fff', border: 'none', padding: '4px 10px', fontSize: 11, textDecoration: 'none', fontWeight: 600 }}
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-text">No candidate profiles found</div>
          </div>
        )}
      </div>

      {/* Job Performance */}
      {analytics?.jobStats?.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <div className="card-title">💼 Jobs Performance</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.jobStats} margin={{ left: -10 }}>
              <XAxis dataKey="title" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="applicants" fill="#6366f1" name="Applicants" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgScore" fill="#a78bfa" name="Avg Score %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
