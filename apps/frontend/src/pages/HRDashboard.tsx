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

  return (
    <div className="page">
      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Active Jobs', value: analytics?.activeJobs || 0, icon: '💼', color: 'indigo', change: '+2 this month', up: true },
          { label: 'Total Applications', value: analytics?.totalApplications || 0, icon: '📋', color: 'purple', change: '+12 this week', up: true },
          { label: 'Interviews Scheduled', value: analytics?.totalInterviews || 0, icon: '📅', color: 'blue', change: `${analytics?.upcomingInterviews || 0} upcoming`, up: true },
          { label: 'Hired This Month', value: analytics?.statusBreakdown?.hired || 0, icon: '🎉', color: 'green', change: `${analytics?.hireRate || 0}% hire rate`, up: true },
          { label: 'Avg Match Score', value: `${analytics?.avgMatchScore || 0}%`, icon: '🎯', color: 'yellow', change: 'AI-powered', up: true },
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
        {/* Recent Applications */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🆕 Recent Applications</div>
            <a href="/applications" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View all →</a>
          </div>
          <div>
            {recentApps.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">No applications yet</div></div>
            ) : recentApps.map((app: any) => (
              <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="avatar avatar-sm">
                  {(app.candidate?.name || 'U')[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{app.candidate?.name || 'Unknown'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{app.job?.title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${statusBadge(app.status)}`}>{app.status.replace(/_/g, ' ')}</span>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{app.matchScore}% match</div>
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
                <div style={{ fontWeight: 600, fontSize: 13 }}>{iv.candidate?.name || 'Candidate'}</div>
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
