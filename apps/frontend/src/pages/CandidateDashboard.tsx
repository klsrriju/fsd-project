import React, { useEffect, useState } from 'react';
import { applicationsAPI, interviewsAPI, jobsAPI, candidateStatsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      applicationsAPI.list(),
      interviewsAPI.list(),
      jobsAPI.list(),
      candidateStatsAPI.get().catch(() => ({ data: { data: null } })),
    ]).then(([a, i, j, s]) => {
      setApplications(a.data.data || []);
      setInterviews(i.data.data || []);
      setJobs(j.data.data || []);
      setStats(s.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const mySkills: string[] = user?.skills || [];
  const statusColor: Record<string, string> = {
    applied: 'badge-indigo',
    shortlisted: 'badge-purple',
    interview_scheduled: 'badge-blue',
    interviewed: 'badge-yellow',
    offered: 'badge-orange',
    hired: 'badge-green',
    rejected: 'badge-red',
  };

  const matchingJobs = jobs.filter((j: any) => {
    const overlap = j.skills?.filter((s: string) => mySkills.map((ms) => ms.toLowerCase()).includes(s.toLowerCase()));
    return (overlap?.length || 0) >= 2;
  }).slice(0, 4);

  const stages = ['applied', 'shortlisted', 'interview_scheduled', 'offered', 'hired'];
  const activeApp = applications.find((a) => !['rejected', 'hired'].includes(a.status));

  return (
    <div className="page">
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #4f46e5)',
        borderRadius: 16, padding: '28px 32px', marginBottom: 24,
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Welcome back</div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>👋 {user?.name}</div>
          <div style={{ marginTop: 8, opacity: 0.75, fontSize: 14 }}>
            {user?.targetRole && `Looking for: ${user.targetRole}`}
            {mySkills.length > 0 && ` • ${mySkills.slice(0, 3).join(', ')}`}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 40, fontWeight: 800 }}>{applications.length}</div>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 600, textTransform: 'uppercase' }}>Applications</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Applied', value: stats?.totalApplications ?? applications.length, icon: '📋', color: 'indigo' },
          { label: 'Shortlisted', value: stats?.statusBreakdown?.shortlisted ?? applications.filter((a) => ['shortlisted', 'interview_scheduled', 'offered', 'hired'].includes(a.status)).length, icon: '⭐', color: 'purple' },
          { label: 'Interviews', value: stats?.upcomingInterviews ?? interviews.filter((i) => i.status === 'scheduled').length, icon: '🎤', color: 'blue', label2: 'Upcoming' },
          { label: 'Profile', value: `${stats?.profileCompletion ?? 0}%`, icon: '👤', color: 'green', label2: 'Complete' },
        ].map((s: any, i) => (
          <div key={i} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label2 || s.label}</div>
          </div>
        ))}
      </div>

      {/* AI Prep Action Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(99, 102, 241, 0.03))',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>💻</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>Technical Coding Prep</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>LeetCode Problems & Pinpoint AI Feedback</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 16px 0', lineHeight: 1.5 }}>
              Practice curated coding challenges with starter templates in 5 languages, instant Big-O analysis, and exact line-by-line improvement suggestions.
            </p>
          </div>
          <a href="/coding-prep" className="btn btn-primary btn-sm" style={{ width: 'fit-content' }}>
            Start Coding Practice →
          </a>
        </div>

        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.03))',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>📄</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>Resume Analyzer & ATS Audit</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Skill Extraction & Presentation Audit</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 16px 0', lineHeight: 1.5 }}>
              Auto-extract 200+ tech skills into your profile, check ATS formatting and action verbs, and get actionable suggestions to elevate your resume.
            </p>
          </div>
          <a href="/resume-analyzer" className="btn btn-outline btn-sm" style={{ width: 'fit-content' }}>
            Audit My Resume →
          </a>
        </div>

        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.03))',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>🎤</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>AI Mock Interview</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Honest Feedback & Motivating Coaching</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 16px 0', lineHeight: 1.5 }}>
              Practice behavioral and technical interview questions with honest STAR-method scoring and tailored, encouraging coaching.
            </p>
          </div>
          <a href="/ai-interview" className="btn btn-outline btn-sm" style={{ width: 'fit-content' }}>
            Practice Interview →
          </a>
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: 24 }}>
        {/* Application Pipeline */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 My Application Pipeline</div>
          </div>
          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">No applications yet</div>
              <div className="empty-state-sub">Browse jobs and apply to get started</div>
              <a href="/jobs" style={{ display: 'inline-block', marginTop: 12 }} className="btn btn-primary btn-sm">Browse Jobs</a>
            </div>
          ) : (
            <div>
              {applications.map((app: any) => (
                <div key={app.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{app.job?.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{app.job?.company} • {new Date(app.appliedAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${statusColor[app.status] || 'badge-gray'}`}>{app.status.replace(/_/g, ' ')}</span>
                      <div style={{ fontSize: 12, marginTop: 4, fontWeight: 700, color: app.matchScore >= 80 ? 'var(--green)' : app.matchScore >= 60 ? 'var(--yellow)' : 'var(--red)' }}>
                        {app.matchScore}% match
                      </div>
                    </div>
                  </div>
                  {/* Stage progress */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    {stages.map((stage, i) => {
                      const stageIdx = stages.indexOf(app.status);
                      const isActive = i === stageIdx;
                      const isPast = i < stageIdx;
                      return (
                        <div key={stage} style={{ flex: 1, height: 4, borderRadius: 2, background: isPast || isActive ? 'var(--primary)' : 'var(--border)', opacity: isActive ? 1 : isPast ? 0.6 : 1 }} />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Interviews */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📅 My Interviews</div>
            <a href="/interviews" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View all →</a>
          </div>
          {interviews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎤</div>
              <div className="empty-state-text">No interviews yet</div>
              <div className="empty-state-sub">Keep applying! Interviews will appear here.</div>
            </div>
          ) : interviews.map((iv: any) => (
            <div key={iv.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--primary-soft)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)' }}>{new Date(iv.scheduledAt).toLocaleDateString('en', { month: 'short' }).toUpperCase()}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>{new Date(iv.scheduledAt).getDate()}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{iv.job?.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{iv.job?.company} • {new Date(iv.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{iv.mode} • {iv.duration}min{iv.platform ? ` • ${iv.platform.replace('_', ' ')}` : ''}</div>
                  {iv.meetLink && (
                    <a href={iv.meetLink} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: 6, display: 'inline-flex' }}>
                      🔗 Join Interview
                    </a>
                  )}
                </div>
                <span className={`badge ${iv.status === 'scheduled' ? 'badge-green' : 'badge-gray'}`}>{iv.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">✨ Recommended Jobs for You</div>
            <div className="card-subtitle">Based on your skills: {mySkills.slice(0, 3).join(', ')}</div>
          </div>
          <a href="/jobs" className="btn btn-ghost btn-sm">Browse all →</a>
        </div>
        {matchingJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <div className="empty-state-text">Add skills to your profile to get recommendations</div>
          </div>
        ) : (
          <div className="job-grid">
            {matchingJobs.map((job: any) => {
              const matched = job.skills?.filter((s: string) => mySkills.map((ms) => ms.toLowerCase()).includes(s.toLowerCase())) || [];
              const score = Math.round((matched.length / Math.max(job.skills?.length, 1)) * 100);
              return (
                <div key={job.id} className="job-card" onClick={() => window.location.href = `/jobs/${job.id}`}>
                  <div className="job-card-header">
                    <div className="job-company-logo">{job.company[0]}</div>
                    <span className={`badge ${job.type === 'remote' ? 'badge-green' : 'badge-indigo'}`}>{job.type}</span>
                  </div>
                  <div className="job-title">{job.title}</div>
                  <div className="job-company">{job.company}</div>
                  <div className="job-meta">
                    <span className="job-meta-item">📍 {job.location}</span>
                    <span className="job-meta-item">💰 {job.salary}</span>
                  </div>
                  <div className="job-skills">
                    {job.skills?.slice(0, 4).map((s: string) => (
                      <span key={s} className="skill-tag" style={{ background: mySkills.map((ms) => ms.toLowerCase()).includes(s.toLowerCase()) ? 'var(--green-soft)' : 'var(--primary-soft)', color: mySkills.map((ms) => ms.toLowerCase()).includes(s.toLowerCase()) ? 'var(--green)' : 'var(--primary-dark)' }}>{s}</span>
                    ))}
                  </div>
                  <div className="job-card-footer">
                    <span className={`match-score-badge ${score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low'}`}>
                      🎯 {score}% match
                    </span>
                    <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); window.location.href = `/jobs/${job.id}`; }}>View →</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
