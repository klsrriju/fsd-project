import React, { useEffect, useState } from 'react';
import { jobsAPI, applicationsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function CandidateRankingPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { jobsAPI.list().then((res) => setJobs(res.data.data.filter((j: any) => j.hrId === user?.id))); }, []);

  async function loadCandidates(jobId: string) {
    setSelectedJob(jobId);
    if (!jobId) return;
    setLoading(true);
    try {
      const res = await jobsAPI.getCandidates(jobId);
      setCandidates(res.data.data);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function quickApply(candidateId: string, jobId: string) {
    try {
      await applicationsAPI.apply({ jobId, candidateId });
      showToast('✅ Candidate invited to apply!');
      loadCandidates(jobId);
    } catch (err: any) {
      showToast('ℹ️ ' + (err.response?.data?.message || 'Already applied'));
    }
  }

  const job = jobs.find((j) => j.id === selectedJob);

  function scoreColor(score: number) {
    if (score >= 80) return 'var(--green)';
    if (score >= 60) return 'var(--yellow)';
    return 'var(--red)';
  }

  return (
    <div className="page">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, background: '#1e1b4b', color: 'white', padding: '12px 20px', borderRadius: 10, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}

      <div className="section-header">
        <div>
          <div className="section-title">🏆 Candidate Leaderboard</div>
          <div className="section-sub">AI-ranked candidates for each of your jobs</div>
        </div>
      </div>

      <div className="form-group" style={{ maxWidth: 400 }}>
        <label className="form-label">Select Job to View Rankings</label>
        <select className="form-select" value={selectedJob} onChange={(e) => loadCandidates(e.target.value)}>
          <option value="">Choose a job...</option>
          {jobs.map((j: any) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>

      {job && (
        <div style={{ background: 'var(--primary-soft)', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #c7d2fe' }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{job.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Required: {job.skills?.join(', ')} • {job.experience}
          </div>
        </div>
      )}

      {loading && <div className="loading"><div className="spinner" /></div>}

      {!loading && candidates.length > 0 && (
        <div>
          {/* Top 3 podium */}
          {candidates.slice(0, 3).length >= 1 && (
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, justifyContent: 'center', alignItems: 'flex-end' }}>
              {[candidates[1], candidates[0], candidates[2]].filter(Boolean).map((c: any, i: number) => {
                const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
                const heights = { 1: 120, 2: 90, 3: 70 };
                const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
                return (
                  <div key={c.candidate.id} style={{ textAlign: 'center', flex: rank === 1 ? 1.2 : 1 }}>
                    <div className="avatar avatar-lg" style={{ margin: '0 auto 8px', background: rank === 1 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : rank === 2 ? 'linear-gradient(135deg, #9ca3af, #6b7280)' : 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                      {c.candidate.name[0]}
                    </div>
                    <div style={{ fontSize: 20 }}>{medals[rank as keyof typeof medals]}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginTop: 4 }}>{c.candidate.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.candidate.targetRole}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: scoreColor(c.matchScore), marginTop: 4 }}>{c.matchScore}%</div>
                    <div style={{ height: heights[rank as keyof typeof heights], background: rank === 1 ? 'var(--primary)' : rank === 2 ? '#9ca3af' : '#f59e0b', borderRadius: '8px 8px 0 0', marginTop: 8, opacity: 0.2 }} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Full rankings table */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>All Candidates ({candidates.length})</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Candidate</th>
                    <th>Education</th>
                    <th>Experience</th>
                    <th>Matched Skills</th>
                    <th>Missing Skills</th>
                    <th>Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c: any, i: number) => (
                    <tr key={c.candidate.id}>
                      <td style={{ fontWeight: 800, color: i < 3 ? 'var(--primary)' : 'var(--text-muted)', fontSize: 16 }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar avatar-sm">{c.candidate.name[0]}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{c.candidate.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.candidate.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>{c.candidate.degree || 'N/A'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.candidate.university || ''}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>{c.candidate.yearsOfExperience || 0} yrs</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                          {c.matchedSkills?.slice(0, 3).map((s: string) => (
                            <span key={s} style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--green-soft)', color: 'var(--green)', fontSize: 10, fontWeight: 600 }}>{s}</span>
                          ))}
                          {c.matchedSkills?.length > 3 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{c.matchedSkills.length - 3}</span>}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                          {c.missingSkills?.slice(0, 2).map((s: string) => (
                            <span key={s} style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--red-soft)', color: 'var(--red)', fontSize: 10, fontWeight: 600 }}>{s}</span>
                          ))}
                          {!c.missingSkills?.length && <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>Perfect ✓</span>}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, fontSize: 16, color: scoreColor(c.matchScore) }}>{c.matchScore}%</div>
                        <div className="progress-bar" style={{ width: 60, marginTop: 4 }}>
                          <div className="progress-fill" style={{ width: `${c.matchScore}%`, background: scoreColor(c.matchScore) }} />
                        </div>
                      </td>
                      <td>
                        {c.application ? (
                          <span className="badge badge-green">Applied ✓</span>
                        ) : (
                          <span className="badge badge-gray">Not applied</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!loading && selectedJob && candidates.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-text">No candidates found</div>
        </div>
      )}

      {!selectedJob && (
        <div className="empty-state" style={{ padding: 64 }}>
          <div className="empty-state-icon">🏆</div>
          <div className="empty-state-text">Select a job to see AI-ranked candidates</div>
          <div className="empty-state-sub">Candidates are automatically ranked by skill match, experience, and education</div>
        </div>
      )}
    </div>
  );
}
